import React from "react";
import { Link as LinkRecord } from "../../../services/ApiTypes";

export const Leader = ({ link }: { link: LinkRecord }) => {
    console.log(link);
    return (
        <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: "100%" }}
        >
            {!link || !link.isSettled ? (
                <h2>No leader, be the first!</h2>
            ) : (
                <React.Fragment>
                    <h2>The Leader</h2>
                    <img src="/public/imgs/bitcoin.png" width="200" />
                    <div>Lightning Node:</div>
                    <h4 style={{ wordBreak: "break-all" }}>{link.invoice.buyerNodeId}</h4>
                </React.Fragment>
            )}
        </div>
    );
};
