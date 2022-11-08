import React, { useEffect, useState } from "react";
import { useApi } from "../../../hooks/UseApi";
import { CreateInvoiceResult } from "../../../services/ApiTypes";

export const InvoiceForm = ({
    linkId,
    startSats,
}: {
    linkId: string;
    startSats: number;
}) => {
    console.log("linkId", linkId);
    console.log("startSats", startSats);

    const [sig, setSig] = useState<string>();
    const [sats, setSats] = useState<number>(startSats);
    const [invoice, setInvoice] = useState<CreateInvoiceResult>();
    const api = useApi();

    function sigChanged(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const value = e.target.value;
        setSig(value);
        if (value) {
            api.createInvoice(value, sats).then(setInvoice).catch(setInvoice);
        }
    }

    function satsChanges(e: React.ChangeEvent<HTMLInputElement>) {
        const value = Number(e.target.value);
        setSats(isNaN(value) ? startSats : value);
    }

    useEffect(() => {
        setSig("");
        setSats(startSats);
        setInvoice(undefined);
    }, [linkId]);

    return (
        <form className="form">
            <h4>
                <strong>Become the leader by following these steps:</strong>
            </h4>
            <div className="form-group">
                <p>
                    <strong>Step 1.</strong> Specify the satoshis you will pay to become the new
                    leader, it must be more than the last amount:
                </p>
                <input
                    type="number"
                    className="form-control"
                    value={sats}
                    onChange={satsChanges}
                ></input>
            </div>
            <div className="form-group mt-3">
                <p>
                    <strong>Step 2.</strong> Sign a message using your Lightning Network node with
                    the following message:
                </p>
                <h4 style={{ wordBreak: "break-all" }}>{linkId}</h4>
            </div>
            <div className="form-group mt-3">
                <p>
                    <strong>Step 3.</strong> Paste your signature to receive an invoice:
                </p>
                <textarea className="form-control" value={sig} onChange={sigChanged}></textarea>
            </div>
            {invoice && (
                <div className="form-group mt-3">
                    <p>
                        <strong>Step 4.</strong> Pay the invoice
                    </p>
                    {invoice.success ? (
                        <textarea
                            className="form-control"
                            value={invoice.paymentRequest}
                            readOnly
                        />
                    ) : (
                        <small className="warning">{invoice.error}</small>
                    )}
                </div>
            )}
        </form>
    );
};
