import re

with open("frontend/src/staff-app/pages/txn/WithdrawStatementsAdmin.tsx", "r") as f:
    content = f.read()

replacement = """                             <td style={{ textAlign: 'center' }}>
                            <button onClick={() => handleCopy(item)}>
                              Copy
                            </button>
                            {item.accountType === 'qr' && item.bankDetail?.qrImageUrl && (
                              <button
                                onClick={() => handleClick(item.bankDetail)}
                                style={{ marginLeft: '5px' }}
                              >
                                View QR
                              </button>
                            )}
                          </td>"""

content = re.sub(r"                             <td style=\{\{ textAlign: 'center' \}\}>\n                            <button onClick=\{\(\) => handleCopy\(item\)\}>\n                              Copy\n                            <\/button>\n                          <\/td>", replacement, content, flags=re.DOTALL)

with open("frontend/src/staff-app/pages/txn/WithdrawStatementsAdmin.tsx", "w") as f:
    f.write(content)
