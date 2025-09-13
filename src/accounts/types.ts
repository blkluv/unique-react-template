import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { BN } from "@polkadot/util";
import { IEthereumExtensionResultSafe } from "@unique-nft/utils/extension";
import { ConnectedWalletsName } from "./useWalletCenter";
import { Eip1193Provider, Signer as EthSigner } from "ethers";
import { PolkadotWalletName } from "./PolkadotWallet";
import { Magic } from "magic-sdk";
import { SignerPayloadJSON } from "@polkadot/types/types";
import { Web3Auth } from "@web3auth/modal";

export enum SignerTypeEnum {
  Polkadot = "Polkadot",
  Ethereum = "Ethereum",
  Magiclink = 'Magiclink',
  Web3Auth = 'Web3Auth',
}

export type BaseWalletType<T> = {
  name: string;
  address: string;
  balance?: number;
  normalizedAddress: string;
  signerType: SignerTypeEnum;
  signer: EthSigner | (T extends InjectedAccountWithMeta ? any : undefined);
  sign?(data: any, account?: any, meta?: any): any;
};

export type BaseWalletEntity<T> = {
  getAccounts(): Promise<Map<string, BaseWalletType<T>>>;
};

export type WalletsType =
  | InjectedAccountWithMeta
  | IEthereumExtensionResultSafe["result"];

export type AccountBalance = {
  raw: BN;
  parsed: string;
};

export type AccountBalances = {
  proper: AccountBalance;
  ethMirror: AccountBalance;
};

// --- CRITICAL FIX: Make signer REQUIRED to match @unique-nft/sdk IAccount interface ---
export interface IAccount {
  address: string;
  normalizedAddress: string;
  name: string;
  balance?: number;
  signerType: SignerTypeEnum;
  signer: EthSigner | any; // REMOVED the ? - signer is now REQUIRED
  walletType?: PolkadotWalletName;
  publicKey?: Uint8Array;
  prefixedAddress?: (prefix?: number) => string;
  verify?: (message: string | Uint8Array, signature: string | Uint8Array) => boolean;
  sign?: (payload: SignerPayloadJSON) => Promise<Uint8Array>;
  walletMetaInformation?: InjectedAccountWithMeta;
}

export type Account = IAccount;

export interface AccountsContextValue {
  accounts: Map<string, Account>;
  setAccounts: React.Dispatch<React.SetStateAction<Map<string, Account>>>;
  selectedAccountId: number;
  setSelectedAccountId: React.Dispatch<React.SetStateAction<number>>;
  selectedAccount: Account | undefined;
  setPolkadotAccountsWithBalance: (walletName?: ConnectedWalletsName) => Promise<void>;
  updateEthereumWallet: () => Promise<void>;
  reinitializePolkadotAccountsWithBalance: () => Promise<void>;
  clearAccounts: () => void;
  loginWithMagicLink: (email: string) => Promise<void>;
  logoutMagicLink: () => Promise<void>;
  loginWithWeb3Auth: () => Promise<void>;
  logoutWeb3Auth: () => Promise<void>;
  providerWeb3Auth: Eip1193Provider | null;
  magic: Magic | null;
  setWeb3Auth: React.Dispatch<React.SetStateAction<Web3Auth | null>>;
  setProviderWeb3Auth: React.Dispatch<React.SetStateAction<Eip1193Provider | null>>;
}