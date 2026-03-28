import re

with open("frontend/src/admin-app/pages/transaction-statement/modal/BankDetailModal.tsx", "r") as f:
    content = f.read()

replacement = """          <div className='modal-body'>
            {bankDetails.imageUrl || bankDetails.qrImageUrl ? (
              <div className='container-fluid'>
                <div className='row m-b-20'>
                  <div className='col-md-12'>
                    <img

                        src={`${process.env.REACT_APP_API_BACKURL}${bankDetails?.imageUrl || bankDetails?.qrImageUrl}`}
                      alt='image'
                      style={{ height: 'auto', width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            ) : ("""

content = re.sub(r"          <div className='modal-body'>\n            \{bankDetails\.imageUrl \? \(\n              <div className='container-fluid'>\n                <div className='row m-b-20'>\n                  <div className='col-md-12'>\n                    <img\n                   \n                        src=\{`\$\{process\.env\.REACT_APP_API_BACKURL\}\$\{bankDetails\?\.imageUrl\}`\}\n                      alt='image'\n                      style=\{\{ height: 'auto', width: '100%' \}\}\n                    \/>\n                  <\/div>\n                <\/div>\n              <\/div>\n            \) : \(", replacement, content, flags=re.DOTALL)

with open("frontend/src/admin-app/pages/transaction-statement/modal/BankDetailModal.tsx", "w") as f:
    f.write(content)
