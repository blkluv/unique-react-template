import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { Polkadot } from "@unique-nft/utils/extension";
import { Address } from "@unique-nft/utils";
import { Keyring } from "@polkadot/api";
import {
  BaseWalletEntity,
  BaseWalletType,
  SignerTypeEnum,
} from "./types";

/**
 * Represents the names of the supported Polkadot-based wallets.
 */
export type PolkadotWalletName =
  | "polkadot-js"
  | "subwallet-js"
  | "talisman"
  | "enkrypt"
  | "novawallet";

/**
 * Class representing a Polkadot wallet integration.
 *
 * @implements {BaseWalletEntity<InjectedAccountWithMeta>}
 */
export class PolkadotWallet
  implements BaseWalletEntity<InjectedAccountWithMeta>
{
  _accounts = new Map<string, BaseWalletType<InjectedAccountWithMeta>>();
  wallet: PolkadotWalletName;

  constructor(defaultWallet: PolkadotWalletName = "polkadot-js") {
    this.wallet = defaultWallet;
  }

  /**
   * Loads and returns the accounts associated with the connected wallet.
   */
  async getAccounts() {
    const wallets = await Polkadot.loadWalletByName(this.wallet);

    const accountEntries = wallets.accounts
      .filter(({ address }) => Address.is.substrateAddress(address))
      .map((account) => {
        if (!account.address) return null;

        try {
          const normalizedAddress = Address.normalize.substrateAddress(account.address);
          const address = Address.normalize.substrateAddress(account.address, 7391);

          const uniqueAccount: BaseWalletType<InjectedAccountWithMeta> & {
            publicKey: Uint8Array;
            prefixedAddress: (prefix?: number) => string;
            verify: (message: string | Uint8Array, signature: string | Uint8Array) => boolean;
          } = {
            name: account.meta.name || "",
            normalizedAddress,
            address,
            walletType: this.wallet,
            walletMetaInformation: account,
            signerType: SignerTypeEnum.Polkadot,

            // --- UniqueChain-required fields ---
            publicKey: (account as any).publicKey || new Uint8Array(),
            prefixedAddress: (prefix?: number) => {
              try {
                const keyring = new Keyring({ type: "sr25519" });
                return keyring.encodeAddress(account.address, prefix ?? 42);
              } catch {
                return account.address;
              }
            },

            // Updated sign function using account.sign
            sign: async (message: string | Uint8Array) => {
              const data = typeof message === "string" ? new TextEncoder().encode(message) : message;
              const result = await account.sign(data);
              return result?.signature ? new Uint8Array(Buffer.from(result.signature, "hex")) : new Uint8Array();
            },

            verify: () => true, // TODO: implement proper verification if needed
            signer: { ...account.signer, address },
          };

          return [account.address, uniqueAccount] as [string, typeof uniqueAccount];
        } catch (error) {
          console.error(`Failed to process account ${account.address}:`, error);
          return null;
        }
      })
      .filter(
        (entry): entry is [string, BaseWalletType<InjectedAccountWithMeta>] => entry !== null
      );

    this._accounts = new Map(accountEntries);
    return this._accounts;
  }
}