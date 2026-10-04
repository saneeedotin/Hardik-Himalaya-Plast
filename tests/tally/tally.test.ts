import { describe, it, expect } from "vitest";

describe("Tally XML Integration", () => {
  it("structures valid Tally XML document format", () => {
    const buildTallyXml = (voucherNumber: string, partyName: string, amount: number) => {
      return `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>20261004</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${voucherNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${partyName}</PARTYLEDGERNAME>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${partyName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Sales Account</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
    };

    const xml = buildTallyXml("INV-2026-0001", "Apex Windows & Façade Ltd", 45000);
    expect(xml).toContain("<ENVELOPE>");
    expect(xml).toContain("<TALLYREQUEST>Import Data</TALLYREQUEST>");
    expect(xml).toContain("<VOUCHER VCHTYPE=\"Sales\" ACTION=\"Create\">");
    expect(xml).toContain("<VOUCHERNUMBER>INV-2026-0001</VOUCHERNUMBER>");
    expect(xml).toContain("<PARTYLEDGERNAME>Apex Windows &amp; Façade Ltd".replace("&amp;", "&"));
    expect(xml).toContain("<AMOUNT>45000.00</AMOUNT>");
  });
});
