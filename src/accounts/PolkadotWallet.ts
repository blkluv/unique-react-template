import { InjectedAccountWithMeta, InjectedExtension } from "@polkadot/extension-inject/types"; // Import InjectedExtension here
import { Polkadot } from "@unique-nft/utils/extension"; // Keep Polkadot as is
import { Address } from "@unique-nft/utils";
import { Keyring } from "@polkadot/api";
import {
  BaseWalletEntity,
  BaseWalletType,
  SignerTypeEnum,
} from "./types";
import { SignerPayloadJSON, SignerResult } from "@polkadot/types/types";

/**
 * Supported Polkadot-based wallets.
 */
export type PolkadotWalletName =
  | "polkadot-js"
  | "subwallet-js"
  | "talisman"
  | "enkrypt"
  | "novawallet";

/**
 * Extended wallet type with walletType and raw account info.
 */
export type UniqueWalletType = BaseWalletType<InjectedAccountWithMeta> & {
  walletType: PolkadotWalletName;
  publicKey: Uint8Array;
  prefixedAddress: (prefix?: number) => string;
  verify: (message: string | Uint8Array, signature: string | Uint8Array) => boolean;
  walletMetaInformation: InjectedAccountWithMeta;
};

/**
 * Polkadot wallet integration.
 */
export class PolkadotWallet implements BaseWalletEntity<InjectedAccountWithMeta> {
  _accounts = new Map<string, UniqueWalletType>();
  wallet: PolkadotWalletName;

  constructor(defaultWallet: PolkadotWalletName = "polkadot-js") {
    this.wallet = defaultWallet;
  }

  async getAccounts() {
    // Correctly type 'wallets' as InjectedExtension | undefined
    const wallets: InjectedExtension | undefined = await Polkadot.loadWalletByName(this.wallet);

    if (!wallets || !wallets.signer) {
      console.error("No Polkadot wallet found or signer not available.");
      return new Map();
    }

    const accountEntries = wallets.accounts
      .filter(({ address }) => Address.is.substrateAddress(address))
      .map((account) => {
        if (!account.address) return null;

        try {
          const normalizedAddress = Address.normalize.substrateAddress(account.address);
          const address = Address.normalize.substrateAddress(account.address, 7391);

          const uniqueAccount: UniqueWalletType = {
            name: account.meta.name || "",
            normalizedAddress,
            address,
            walletType: this.wallet,
            walletMetaInformation: account,
            signerType: SignerTypeEnum.Polkadot,
            publicKey: (account as any).publicKey || new Uint8Array(),
            prefixedAddress: (prefix?: number) => {
              try {
                const keyring = new Keyring({ type: "sr25519" });
                return keyring.encodeAddress(account.address, prefix ?? 42);
              } catch {
                return account.address;
              }
            },
            // The sign method now correctly accepts the correct payload type
            sign: async (payload: SignerPayloadJSON) => {
              const signer = wallets.signer; // Get the signer from the wallet extension
              
              if (!signer || !signer.signPayload) {
                console.error("No signPayload method available for this account's signer", account);
                return new Uint8Array();
              }
              
              const result: SignerResult = await signer.signPayload(payload);
              
              return result?.signature
                ? new Uint8Array(Buffer.from(result.signature.slice(2), "hex"))
                : new Uint8Array();
            },
            verify: () => true, // TODO: implement proper verification
            signer: wallets.signer, // Set the signer property on the uniqueAccount object
          };

          return [account.address, uniqueAccount] as [string, UniqueWalletType];
        } catch (error) {
          console.error(`Failed to process account ${account.address}:`, error);
          return null;
        }
      })
      .filter(
        (entry): entry is [string, UniqueWalletType] => entry !== null
      );

    this._accounts = new Map(accountEntries);
    return this._accounts;
  }
}