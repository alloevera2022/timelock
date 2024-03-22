import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const url = `https://mainnet.helius-rpc.com/?api-key=59dcc64e-6eaa-4d48-b97e-407c2792cb52`;

export const useTableOfAssets = () => {
    const { publicKey: userWalletPublicKey } = useWallet();
    const [error, setError] = useState(null);
    const [names, setNames] = useState([]);

    useEffect(() => {
        if (!userWalletPublicKey) return;
        const getAssetsByOwner = async () => {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        jsonrpc: '2.0', 
                        id: 'my-id', 
                        method: 'getAssetsByOwner', 
                        params: { 
                            ownerAddress: userWalletPublicKey.toBase58(), 
                            page: 1, 
                            limit: 1000, 
                            displayOptions: { showFungible: true } 
                        } 
                    })
                });
                const { result } = await response.json();
                const newNames = result.items.reduce((acc, el) => {
                    if (el.interface === "FungibleToken") {
                        let label = el.content.metadata.name !== undefined ? el.content.metadata.name : el.id;
                        if (label.length > 18) {
                            label = `${label[0]}${label[2]}${label[2]}${label[3]}...${label[label.length - 4]}${label[label.length - 3]}${label[label.length - 2]}${label[label.length - 1]}`
                        }
                        const value = el.token_info.balance / 10 ** el.token_info.decimals;
                        const icon = el.content.links.image !== undefined ? el.content.links.image : 'https://png.pngtree.com/png-clipart/20190614/original/pngtree-%EF%BB%BFcoin-gold-png-image_3724480.jpg'
                        acc.push({ label, value, icon });
                    }
                    return acc;
                }, []);
                setNames(newNames);
            } catch (error) { setError(error.message); }
        };
        getAssetsByOwner();
        
    }, [userWalletPublicKey]);

    return { names, error };
};

const TableOfAssets = () => {
    const { names, error } = useTableOfAssets();

    if (names.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '80%', marginTop: '20px'}}>
            {error && <p>{error}</p>}
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '16px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#33B18B', color: 'white' }}>
                        <th style={{ border: '1px solid #ddd', padding: '16px' }}>Token</th>
                        <th style={{ border: '1px solid #ddd', padding: '16px' }}>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {names.map((item, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f2f2f2' : 'white' }}>
                            <td style={{ border: '1px solid #ddd', padding: '16px', display: 'flex', alignItems: 'center'}}>
                                <img src={item.icon} alt="Token Icon" style={{ width: '40px', height: '40px', marginRight: '10px', borderRadius: '50%' }} />
                                {item.label}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '16px', textAlign: 'center'}}>{item.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableOfAssets;
