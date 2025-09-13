import { useCallback, useState } from 'react';
import { PolkadotWallet, PolkadotWalletName } from './PolkadotWallet';
import { BaseWalletType } from './types';

export type ConnectedWalletsName = 'polkadot-js' | 'keyring' | 'metamask' | 'talisman' | 'subwallet-js' | 'enkrypt' | 'novawallet';

const wallets = new Map<
  ConnectedWalletsName,
  typeof PolkadotWallet 
>([
  ['polkadot-js', PolkadotWallet],
  ['talisman', PolkadotWallet],
  ['subwallet-js', PolkadotWallet],
  ['enkrypt', PolkadotWallet],
  ['novawallet', PolkadotWallet],
]);

export const CONNECTED_WALLET_TYPE = 'connected-wallet-type';

export const useWalletCenter = (chainProperties?: any) => {
  const [connectedWallets, setConnectedWallets] = useState(
    new Map<ConnectedWalletsName, Map<string, BaseWalletType<any>>>([])
  );

  const connectWallet = useCallback(
    async (typeWallet: ConnectedWalletsName) => {
      try {
        const wallet = new (wallets.get(typeWallet)!)(typeWallet as PolkadotWalletName);
        const currentWallets = await wallet.getAccounts();
        
        // Handle case where user denies access or no accounts found
        if (currentWallets.size === 0) {
          throw new Error(`ACCESS_DENIED: Please approve access in your ${typeWallet} extension for this website`);
        }

        const connectedWallets =
          localStorage.getItem(CONNECTED_WALLET_TYPE)?.split(';') || [];

        if (!connectedWallets.includes(typeWallet)) {
          connectedWallets.push(typeWallet);
          localStorage.setItem(CONNECTED_WALLET_TYPE, connectedWallets.join(';'));
        }

        setConnectedWallets((prev) => new Map([...prev, [typeWallet, currentWallets]]));
        return currentWallets;
      } catch (e: any) {
        // Improved error handling with specific messages
        if (e.message.includes('ACCESS_DENIED')) {
          throw new Error(e.message); // Pass through our custom error
        } else if (e.message.includes('access') || e.message.includes('approve')) {
          throw new Error(`Please approve access for this site in your ${typeWallet} wallet extension. Go to your wallet settings and whitelist this domain.`);
        } else if (e.message.includes('Not installed')) {
          throw new Error(`${typeWallet} extension not found. Please install it first.`);
        }
        
        // Clean up localStorage on error
        const connectedWallets =
          localStorage.getItem(CONNECTED_WALLET_TYPE)?.split(';') || [];
        if (connectedWallets.includes(typeWallet)) {
          localStorage.setItem(
            CONNECTED_WALLET_TYPE,
            connectedWallets.filter((type) => type !== typeWallet).join(';')
          );
        }
        
        throw new Error(`Failed to connect ${typeWallet}: ${e.message}`);
      }
    },
    []
  );

  return {
    connectWallet,
    connectedWallets
  } as const;
};