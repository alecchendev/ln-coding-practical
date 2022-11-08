import React, { useEffect, useState } from "react";
import { useSocket } from "../../hooks/UseSocket";
import { useApi } from "../../hooks/UseApi";
import { Link } from "../../services/ApiTypes";
import { LinkList } from "./components/LinkList";
import { InvoiceForm } from "./components/InvoiceForm";
import { Leader } from "./components/Leader";

export const HomeScene = () => {
    const api = useApi();
    const [links, setLinks] = useState<Link[]>([]);

    useEffect(() => {
        api.getOwners().then(allOwners => setLinks(allOwners.reverse()));
    }, []);

    useSocket("links", (leaders: Link[]) => {
        const copy = links.slice();
        for (const leader of leaders) {
            const index = copy.findIndex(p => p.linkId === leader.linkId);
            if (index >= 0) {
                copy[index] = leader;
                continue;
            } else {
                copy.unshift(leader);
            }
        }
        setLinks(copy);
    });

    console.log(links);

    return (
        <div className="container">
            <div className="row mb-5">
                <div className="col text-center">
                    <h1>Ruler of Satoshi</h1>
                </div>
            </div>
            <div className="row">
                <div className="col" style={{ borderRight: "1px solid #c0c0c0" }}>
                    <Leader link={links[1]} />
                </div>
                <div className="col ml-5">
                    <InvoiceForm
                        linkId={links[0]?.linkId}
                        startSats={Number(links[0]?.minSats || 0)}
                    />
                </div>
            </div>
            <div className="row mt-5">
                <div className="col">
                    <LinkList links={links} />
                </div>
            </div>
        </div>
    );
};
