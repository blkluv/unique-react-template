# Unique Network React Boilerplate

This boilerplate aims to simplify working with Unique Network and Unique SDK.

\`\`\`sh
yarn
yarn start
\`\`\`

> [!IMPORTANT]
> There are specific versions of this template:
> - For the EVM workshop, use https://github.com/UniqueNetwork/unique-react-template/tree/workshop-evm
> - For the legacy version of Unique SDK-1.0, use https://github.com/UniqueNetwork/unique-react-template/tree/sdk-1


### Connect to Unique SDK

This boilerplate utilizes `@unique-nft/sdk` which allows an easy and efficient way to interact with substrate-based networks. Read more about SDK in [documentation](https://docs.unique.network/build/sdk/getting-started.html)

Learn how to:

- Connect to Unique Network using Unique SDK: [`src/sdk/SdkContext.tsx`](./src/sdk/SdkContext.tsx)
- Initialize and access UniqueChain and UniqueScan instances: [`src/hooks/useChainAndScan.ts`](./src/hooks/useChainAndScan.ts)

### Work with accounts and wallets

This boilerplate supports Polkadot wallets such as `Polkadot{.js}`, `Talisman`, `SubWallet`, `Enkrypt`.

EVM wallets supports by `WalletConnect`.

Read more about working with accounts in [documentation](https://docs.unique.network/tutorials/work-with-accounts.html) 

Learn how to:

- Integrate with Polkadot wallets: [`/src/accounts/PolkadotWallet.ts`](./src/accounts/PolkadotWallet.ts). This file handles the integration with various Polkadot-based wallets. It is responsible for loading wallet accounts, normalizing addresses, and managing account-related operations specific to the Polkadot ecosystem.
- Integrate with EVM wallets via WalletConnect: [`/src/components/WalletConnectProviders.tsx`](./src/components/WalletConnectProviders.tsx) This file contains all the logic related to connecting and managing EVM wallets using WalletConnect, providing a convenient and modular structure for handling connections and interactions with Ethereum wallets.
- Manage multiple wallet connections and interactions: [`src/accounts/useWalletCenter.tsx`](./src/accounts/useWalletCenter.tsx). This custom React hook is designed to manage the connection and state of multiple blockchain wallets, including Polkadot and Ethereum wallets. It provides functionality for connecting to wallets, storing connected wallets in local storage, and updating the state of connected accounts.
- Centralize account management and state: [`src/accounts/AccountsContext.tsx`](./src/accounts/AccountsContext.tsx). This file sets up a React context for managing blockchain accounts, including both Polkadot and Ethereum wallets. It provides a unified interface for interacting with accounts, updating balances, and handling account selection across the application.

### Make transactions

Read how to create collections and tokens in [Unique Docs](https://docs.unique.network/build/sdk/v2/balances.html)

Learn how to:

- transfer native tokens: [`src/modals/TransferAmountModal.tsx`](./src/modals/TransferAmountModal.tsx)
- transfer NFTs: [`src/modals/TransferNFTModal.tsx`](./src/modals/TransferNFTModal.tsx)
- Nest tokens: [`src/modals/NestModal.tsx`](./src/modals/NestModal.tsx). Read more about [nesting](https://docs.unique.network/build/sdk/v2/tokens.html#nesting)
- burn tokens: [`src/modals/BurnModal.tsx`](./src/modals/BurnModal.tsx)

---

# Extended Documentation

## 🎯 Key Features

### NFT Operations
- **Transfer NFT** - Transfer tokens between accounts (Substrate + EVM)
- **Burn NFT** - Burn tokens
- **Nest/Unnest** - Nest tokens within each other
- **View metadata** - Complete information about tokens and attributes
- **Nested NFT management** - Work with token hierarchies

### Collection Management
- **View collections** - Detailed collection information
- **Transfer Collection** - Transfer collection ownership via EVM
- **Collection settings** - Limits, permissions, sponsorship
- **Token listing** - View all NFTs in a collection

### Wallet Connection
- **Polkadot wallets** - Polkadot.js, Talisman, SubWallet, Enkrypt
- **Ethereum wallets** - MetaMask, Zerion, Trust Wallet via WalletConnect
- **Magic Link** - Email authentication
- **Web3Auth** - Social authentication

### EVM Integration
- **Smart contract deployment** - Deploy Solidity contracts
- **Contract function calls** - Interact with deployed contracts
- **Dual-layer operations** - Substrate + EVM in one application

## 🔧 Unique SDK + EVM Integration

### Core EVM Imports
\`\`\`typescript
// For working with NFT collections via EVM
import { UniqueNFTFactory } from '@unique-nft/solidity-interfaces'

// For working with fungible tokens via EVM  
import { UniqueFungibleFactory } from '@unique-nft/solidity-interfaces'

// For working with ethers.js
import { ethers } from 'ethers'

// For converting addresses between Substrate and Ethereum
import { Address } from '@unique-nft/utils'
\`\`\`

### SDK Initialization
\`\`\`typescript
import { UniqueChain } from '@unique-nft/sdk'

const sdk = UniqueChain({ 
  baseUrl: process.env.REACT_APP_REST_URL,
  account: selectedAccount 
})
\`\`\`

### NFT Operations

#### Transfer Token (Substrate)
\`\`\`typescript
await sdk.token.transfer({
  to: receiverAddress,
  collectionId: 1,
  tokenId: 1
})
\`\`\`

#### Transfer Token (EVM)
\`\`\`typescript
// Get EVM collection contract
const collection = await UniqueNFTFactory(collectionId, signer)

// Convert addresses for cross-chain operations
const fromCross = Address.extract.ethCrossAccountId(fromAddress)
const toCross = Address.extract.ethCrossAccountId(toAddress)

// Transfer via EVM
await collection.transferFromCross(fromCross, toCross, tokenId)
\`\`\`

#### Burn Token
\`\`\`typescript
// Substrate
await sdk.token.burn({
  collectionId: 1,
  tokenId: 1
})

// EVM
const collection = await UniqueNFTFactory(collectionId, signer)
await collection.burn(tokenId)
\`\`\`

#### Token Nesting
\`\`\`typescript
// Nest token inside another token
await sdk.token.nest({
  parent: {
    collectionId: 1,
    tokenId: 1
  },
  nested: {
    collectionId: 2,
    tokenId: 5
  }
})

// Unnest token
await sdk.token.unnest({
  nested: {
    collectionId: 2,
    tokenId: 5
  }
})
\`\`\`

### Collection Management

#### Get Collection via EVM
\`\`\`typescript
// Initialize EVM collection contract
const getCollection = async (authProvider: ethers.Eip1193Provider, collectionId: string) => {
  const provider = new ethers.BrowserProvider(authProvider)
  const signer = await provider.getSigner()
  return await UniqueNFTFactory(+collectionId, signer)
}
\`\`\`

#### Transfer Collection (EVM)
\`\`\`typescript
const collection = await UniqueNFTFactory(collectionId, signer)
const toCross = Address.extract.ethCrossAccountId(newOwnerAddress)
await collection.changeCollectionOwnerCross(toCross)
\`\`\`

### Fungible Token Operations (EVM)
\`\`\`typescript
// Initialize UniqueFungible contract
const uniqueFungible = await UniqueFungibleFactory(0, signer)

// Transfer tokens
const fromCross = Address.extract.ethCrossAccountId(fromAddress)
const toCross = Address.extract.ethCrossAccountId(toAddress)
const amountRaw = BigInt(amount) * BigInt(10) ** BigInt(18)

await uniqueFungible.transferFromCross(fromCross, toCross, amountRaw)
\`\`\`

### Smart Contract Deployment and Interaction

#### Deploy Contract (Substrate)
\`\`\`typescript
const result = await sdk.evm.deploy(
  { bytecode: contractBytecode },
  { signerAddress: selectedAccount.address }
)
const contractAddress = result.result.contractAddress
\`\`\`

#### Deploy Contract (EVM)
\`\`\`typescript
const factory = new ethers.ContractFactory(abi, bytecode, signer)
const contract = await factory.deploy()
await contract.waitForDeployment()
const contractAddress = await contract.getAddress()
\`\`\`

#### Call Contract Functions (Substrate)
\`\`\`typescript
// Call view function
const result = await sdk.evm.call({
  functionName: 'retrieve',
  functionArgs: [],
  contract: {
    address: contractAddress,
    abi: contractAbi,
  },
})

// Call state-changing function
await sdk.evm.send({
  functionName: 'store',
  functionArgs: [BigInt(value)],
  contract: {
    address: contractAddress,
    abi: contractAbi,
  },
})
\`\`\`

#### Call Contract Functions (EVM)
\`\`\`typescript
const contract = new ethers.Contract(contractAddress, abi, signer)

// View function
const result = await contract.retrieve()

// State-changing function
const tx = await contract.store(BigInt(value))
await tx.wait()
\`\`\`

## 🔐 Wallet Connection

### Polkadot Wallets
\`\`\`typescript
import { useWalletCenter } from './accounts/useWalletCenter'

const { connectWallet } = useWalletCenter()

// Connect various wallets
await connectWallet('polkadot-js')
await connectWallet('talisman')
await connectWallet('subwallet-js')
await connectWallet('enkrypt')
\`\`\`

### Ethereum Wallets (WalletConnect)
\`\`\`typescript
import { useAccount, useConnect } from 'wagmi'

const { address } = useAccount()
const { connect, connectors } = useConnect()

// Connect MetaMask, Zerion, Trust Wallet
connectors.forEach(connector => {
  if (connector.name === 'MetaMask') {
    connect({ connector })
  }
})
\`\`\`

### Magic Link Authentication
\`\`\`typescript
import { useAccountsContext } from './accounts/AccountsContext'

const { loginWithMagicLink, logoutMagicLink, magic } = useAccountsContext()

// Login via email
await loginWithMagicLink('user@example.com')

// Use Magic Link provider for EVM operations
const provider = new ethers.BrowserProvider(magic.rpcProvider as any)
const magicSigner = await provider.getSigner()
const uniqueFungible = await UniqueFungibleFactory(0, magicSigner)
\`\`\`

### Web3Auth
\`\`\`typescript
const { loginWithWeb3Auth, logoutWeb3Auth, providerWeb3Auth } = useAccountsContext()

// Social authentication
await loginWithWeb3Auth()

// Use Web3Auth provider for EVM
const provider = new ethers.BrowserProvider(providerWeb3Auth as any)
const web3AuthSigner = await provider.getSigner()
\`\`\`


## 📋 Usage Examples

### Universal NFT Transfer (Substrate + EVM)
\`\`\`typescript
import { useSdkContext } from './sdk/SdkContext'
import { useAccountsContext } from './accounts/AccountsContext'
import { UniqueNFTFactory } from '@unique-nft/solidity-interfaces'
import { Address } from '@unique-nft/utils'

function UniversalTransferButton({ tokenId, collectionId }) {
  const { sdk } = useSdkContext()
  const { selectedAccount } = useAccountsContext()
  const signer = useEthersSigner()
  
  const handleTransfer = async (toAddress: string) => {
    if (!selectedAccount) return
    
    try {
      if (selectedAccount.signerType === SignerTypeEnum.Polkadot) {
        // Substrate transfer
        await sdk.token.transfer({
          to: toAddress,
          collectionId,
          tokenId
        })
      } else {
        // EVM transfer
        const collection = await UniqueNFTFactory(collectionId, signer)
        const fromCross = Address.extract.ethCrossAccountId(selectedAccount.address)
        const toCross = Address.extract.ethCrossAccountId(toAddress)
        await collection.transferFromCross(fromCross, toCross, tokenId)
      }
      console.log('Transfer successful!')
    } catch (error) {
      console.error('Transfer failed:', error)
    }
  }
  
  return <button onClick={() => handleTransfer('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')}>
    Transfer NFT
  </button>
}
\`\`\`

### Working with EVM Contracts
\`\`\`typescript
// Using ready-made hook for UniqueNFTFactory
import { useUniqueNFTFactory } from './hooks/useUniqueNFTFactory'

function CollectionManager({ collectionId }) {
  const { getUniqueNFTFactory } = useUniqueNFTFactory(collectionId)
  
  const handleCollectionOperation = async () => {
    const collection = await getUniqueNFTFactory()
    if (!collection) return
    
    // Now you can use all EVM contract methods
    const totalSupply = await collection.totalSupply()
    console.log('Total supply:', totalSupply.toString())
  }
}
\`\`\`

### EVM Contract Testing
\`\`\`typescript
// The /evm-test page provides a complete interface for:
// - Deploying arbitrary Solidity contracts
// - Calling contract functions
// - Testing via Substrate SDK and ethers.js
// - Working with various wallet types
\`\`\`

## 🔍 Project Structure

\`\`\`
src/
├── sdk/SdkContext.tsx              # Unique SDK context
├── accounts/                       # Account management
│   ├── AccountsContext.tsx         # Accounts context
│   ├── PolkadotWallet.ts          # Polkadot wallets
│   └── useWalletCenter.tsx        # Wallet management center
├── modals/                        # Operation modals
│   ├── TransferNFTModal.tsx       # NFT transfer
│   ├── TransferAmountModal.tsx    # Fungible token transfer (EVM)
│   ├── BurnModal.tsx              # NFT burning
│   ├── NestModal.tsx              # NFT nesting
│   └── UnnestModal.tsx            # NFT unnesting
├── pages/                         # Application pages
│   ├── TokenPage.tsx              # Token page
│   ├── CollectionPage.tsx         # Collection page
│   ├── EvmTest.tsx                # EVM contract testing
│   └── SingleAccountPage.tsx      # Account page
├── hooks/                         # Custom hooks
│   ├── useUniqueNFTFactory.ts     # EVM contract operations
│   ├── useSigner.ts               # viem to ethers.js conversion
│   └── useIsOwner.ts              # Ownership verification
├── utils/                         # Utilities
│   └── getCollection.ts           # EVM collection retrieval
└── data/
    └── storage-artifacts.json     # ABI and bytecode for tests
\`\`\`

## 🌐 Supported Networks

- **Unique Opal** (testnet) - default
- **Unique Mainnet** - for production  
- **Quartz** - Kusama parachain

To switch networks, change the `REACT_APP_CHAIN_*` environment variables

## 📚 Useful Links

- [Unique Network SDK](https://github.com/UniqueNetwork/unique-sdk)
- [Solidity Interfaces](https://github.com/UniqueNetwork/unique-contracts)
- [Unique Network Documentation](https://docs.unique.network/)
- [EVM on Unique Network](https://docs.unique.network/build/evm/)
- [Unique Scan Explorer](https://uniquescan.io/)
- [Substrate Portal](https://polkadot.js.org/apps/)

## 🤝 Support

- **GitHub Issues** - for bugs and suggestions
- **Telegram** - [@UniqueNetwork](https://t.me/UniqueNetwork)
- **Discord** - [Unique Network](https://discord.gg/jHVdZhsakC)
