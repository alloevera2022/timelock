import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

const url = `https://mainnet.helius-rpc.com/?api-key=59dcc64e-6eaa-4d48-b97e-407c2792cb52`;
const imageUrl = 'https://cdn.helius-rpc.com/cdn-cgi/image//https://black-central-louse-585.mypinata.cloud/ipfs/Qmcna9Bvbubpt2HpoYowTmCpkmVierTegYK9t2XvqnXmau';

const TableOfAssets = () => {
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
                console.log(result.items);
                const newNames = result.items.reduce((acc, el) => {
                    if (el.interface === "FungibleToken") {
                       
                        let name = el.content.metadata.name !== undefined ? el.content.metadata.name : el.id;
                        if (name.length > 18) {
                            name = `${name[0]}${name[2]}${name[2]}${name[3]}...${name[name.length - 4]}${name[name.length - 3]}${name[name.length - 2]}${name[name.length - 1]}`
                        }
                        const balanceInAbsolute = el.token_info.balance / 10 ** el.token_info.decimals;
                        const img = el.content.links.image !== undefined ? el.content.links.image : 'https://png.pngtree.com/png-clipart/20190614/original/pngtree-%EF%BB%BFcoin-gold-png-image_3724480.jpg'
                        acc.push([name, balanceInAbsolute, img]);
                    }
                    return acc;
                }, []);
                setNames(newNames);
            } catch (error) { setError(error.message); }
        };
        getAssetsByOwner();
    }, [userWalletPublicKey]);

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
                                <img src={item[2]} alt="Token Icon" style={{ width: '40px', height: '40px', marginRight: '10px', borderRadius: '50%' }} />
                                {item[0]}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '16px', textAlign: 'center'}}>{item[1]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableOfAssets;
