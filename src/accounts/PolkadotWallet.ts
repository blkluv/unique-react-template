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
  /**
   * A map that holds the accounts associated with this wallet.
   *
   * @private
   */
  _accounts = new Map<string, BaseWalletType<InjectedAccountWithMeta>>();

  /**
   * The name of the wallet being used.
   *
   * @type {PolkadotWalletName}
   */
  wallet: PolkadotWalletName;

  constructor(defaultWallet: PolkadotWalletName = "polkadot-js") {
    this.wallet = defaultWallet;
  }

  /**
   * Loads and returns the accounts associated with the connected wallet.
   *
   * @throws Will throw an error if the account processing fails.
   */
  async getAccounts() {
    const wallets = await Polkadot.loadWalletByName(this.wallet);

    const accountEntries = wallets.accounts
      .filter(({ address }) => Address.is.substrateAddress(address))
      .map((account) => {
        if (!account.address) return null;

        try {
          // Normalized addresses
          const normalizedAddress =
            Address.normalize.substrateAddress(account.address);
          const address = Address.normalize.substrateAddress(
            account.address,
            7391 // Unique network prefix
          );

          // Build UniqueChain-compatible account
          const uniqueAccount = {
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
            sign: async (message: string | Uint8Array) => {
              const result = await account.signer.signRaw({
                address: account.address,
                data:
                  typeof message === "string"
                    ? message
                    : Buffer.from(message).toString("hex"),
                type: "bytes",
              });
              return new Uint8Array(Buffer.from(result.signature, "hex"));
            },
            verify: () => true, // TODO: implement proper verification if needed

            signer: { ...account.signer, address },
          } as BaseWalletType<InjectedAccountWithMeta> & {
            publicKey: Uint8Array;
            prefixedAddress: (prefix?: number) => string;
            verify: (message: string | Uint8Array, signature: string | Uint8Array) => boolean;
          };

          return [account.address, uniqueAccount] as [
            string,
            typeof uniqueAccount
          ];
        } catch (error) {
          console.error(`Failed to process account ${account.address}:`, error);
          return null;
        }
      })
      .filter(
        (entry): entry is [string, BaseWalletType<InjectedAccountWithMeta>] =>
          entry !== null
      );

    this._accounts = new Map(accountEntries);

    return this._accounts;
  }
}