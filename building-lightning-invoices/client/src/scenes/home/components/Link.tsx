import React from "react";
import { Link as LinkRecord } from "../../../services/ApiTypes";

export const Link = ({ link }: { link: LinkRecord }) => {
    return (
        <tr>
            <td style={{ wordBreak: "break-all" }}>{link.invoice.buyerNodeId}</td>
            <td style={{ wordBreak: "break-all" }}>{link.invoice.linkId}</td>
            <td style={{ wordBreak: "break-all" }}>{link.localSignature}</td>
            <td style={{ wordBreak: "break-all" }}>{link.nextLinkId}</td>
            <td>{link.invoice.valueSat}</td>
            <td>
                {new Date(link.invoice.settleDate * 1000).toLocaleDateString()}{" "}
                {new Date(link.invoice.settleDate * 1000).toLocaleTimeString()}
            </td>
        </tr>
    );
};
