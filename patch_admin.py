import re

with open("frontend/src/admin-app/pages/transaction-statement/WithdrawStatementAdmin.tsx", "r") as f:
    content = f.read()

replacement = """
                        <tr key={item._id}>
                          <td style={{ textAlign: 'center' }}>
                            {moment(item.createdAt).format('DD/MM/YYYY h:mm:ss A')}
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.username}</td>

                          <td style={{ textAlign: 'center' }}>
                            <button onClick={() => handleCopy(item)}>
                              Copy
                            </button>
                            {item.accountType === 'qr' && item.bankDetail?.qrImageUrl && (
                              <button
                                data-toggle='modal'
                                data-target='#bankModal'
                                onClick={() => handleClick(item.bankDetail)}
                                style={{ marginLeft: '5px' }}
                              >
                                View QR
                              </button>
                            )}
                          </td>

                          <td style={{ textAlign: 'center' }}>{item.bankDetail.accountHolderName}</td>
                          <td style={{ textAlign: 'center' }}>{item.bankDetail.accountNumber}</td>
                          <td style={{ textAlign: 'center' }}>{item.bankDetail.ifscCode}</td>
                          <td style={{ textAlign: 'center' }}>{item.bankDetail.upiId}</td>

                          {/* <td></td> */}
                          <td style={{ textAlign: 'center' }}>{item.accountType}</td>
"""

content = re.sub(r"                        <tr key=\{item\._id\}>.*?<td style=\{\{ textAlign: 'center' \}\}>\{item\.accountType\}<\/td>", replacement, content, flags=re.DOTALL)

with open("frontend/src/admin-app/pages/transaction-statement/WithdrawStatementAdmin.tsx", "w") as f:
    f.write(content)
