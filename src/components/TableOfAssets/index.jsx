import React, { useState, useEffect } from 'react';

const url = `https://mainnet.helius-rpc.com/?api-key=59dcc64e-6eaa-4d48-b97e-407c2792cb52`;

const TableOfAssets = () => {
    const [assets, setAssets] = useState([]);
    const [error, setError] = useState(null);
    const [names, setNames] = useState([]);

    useEffect(() => {
        const getAssetsByOwner = async () => {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 'my-id',
                        method: 'getAssetsByOwner',
                        params: {
                            ownerAddress: '5LmtL37umzCRHCCNheBFZrKsEhBjDrW8xVUwrFhwFpRK',
                            page: 1, // Starts at 1
                            limit: 1000,
                            displayOptions: {
                                showFungible: true //return both fungible and non-fungible tokens
                            }
                        },
                    }),
                });
                const { result } = await response.json();
                const newNames = result.items.reduce((acc, el) => {
                    if (el.interface === "FungibleToken") {
                        const name = el.content.metadata.name !== undefined ? el.content.metadata.name : el.id;
                        const balanceInAbsolute = el.token_info.balance / 10 ** el.token_info.decimals;
                        acc.push([name, balanceInAbsolute]);
                    }
                    return acc;
                }, []);
                setNames(newNames);
            } catch (error) {
                setError(error.message);
            }
        };
        getAssetsByOwner();
    }, []);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '20px'
        }}>
            {error && <p>{error}</p>}
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                    <tr style={{ backgroundColor: '#33B18B', color: 'white' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Token</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {names.map((item, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f2f2f2' : 'white' }}>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item[0]}</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item[1]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableOfAssets;
