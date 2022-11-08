import React from "react";
import { Link as LinkRecord } from "../../../services/ApiTypes";
import { Link } from "./Link";

export const LinkList = ({ links }: { links: LinkRecord[] }) => {
    if (links.length === 1) return <div></div>;
    return (
        <div style={{ borderTop: "1px solid #c0c0c0" }}>
            <h4 className="mt-3 mb-3">Ruler History</h4>
            <table className="table">
                <thead>
                    <tr>
                        <td>Node Id</td>
                        <td>Prior Preimage</td>
                        <td>Server Secret</td>
                        <td>Preimage</td>
                        <td>Sats</td>
                        <td>Date</td>
                    </tr>
                </thead>
                <tbody>
                    {links
                        .filter(p => p.isSettled)
                        .map(link => (
                            <Link key={link.linkId} link={link} />
                        ))}
                </tbody>
            </table>
        </div>
    );
};
