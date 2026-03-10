import useDeposit from "../../_hooks/useDeposit";
import PaymentQRCode from "../../components/PaymentQRCode";
import DepositStatement2 from "../depositstatement/depositstatement2";
import "./deposit.css";
import { toast } from "react-toastify";

const Deposit = () => {
  const {
    register,
    handleSubmit,
    amount,
    handleChange,
    onSubmit,
    accounts,
    selectedAccount,
    setSelectedAccount,
    handleUploadedFile,
    preview,
    generateTransactionId,
    handleUploadedUTR,
  } = useDeposit();

  const copytoclipboard = (code: string) => {
    const textArea = document.createElement("textarea");
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      toast.success("Copied succesfull");
    } catch (err) {
      console.log("Oops, unable to copy");
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="mt-10">
      <div className="card mb-10">
        <div className="card-header">
          <h4 className="mb-0">Deposit</h4>
        </div>
        <div className="card-body">
          <div className="deposit-page deposit">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="deposit-form" style={{ padding: "0px" }}>
                <div className="row row5 mt-2">
                  <div className="col-md-3 col-12">
                    <label className="w-100 label-amount">Enter Amount:</label>
                    <div className="form-group mb-3 depo-amount">
                      <input
                        type="number"
                        placeholder="Amount"
                        className="form-control"
                        {...register("amount")}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Selection Tabs */}
              {amount && Number(amount) > 0 && accounts.length > 0 && (
                <div className="mb-3">
                  <p className="font-weight-bold mb-2">Select Payment Account:</p>
                  <div className="d-flex flex-wrap" style={{ gap: "10px" }}>
                    {accounts.map((acc: any) => (
                      <div
                        key={acc._id}
                        className={`card text-center p-2`}
                        style={{
                          cursor: "pointer",
                          minWidth: "120px",
                          border: selectedAccount?._id === acc._id ? "2px solid #007bff" : "1px solid #ddd",
                          background: selectedAccount?._id === acc._id ? "#e3f2fd" : "#fff",
                        }}
                        onClick={() => setSelectedAccount(acc)}
                      >
                        <strong style={{ fontSize: "13px" }}>{acc.bankName}</strong>
                        <small className="text-muted">{acc.accountHolderName}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Account Details */}
              {amount && Number(amount) > 0 && selectedAccount && (
                <div
                  className="payment-ions-container"
                >
                  {/* UPI Section */}
                  <div className="payment-icons" style={{ width: "100%" }}>
                    <div className="glass" />
                    <div className="content">
                      <div className="payment-icons-title">
                        <h4 className="mb-0">
                          <span>UPI Payment</span>{" "}
                          <i className="fas fa-info-circle payment-rules" />
                        </h4>
                        <p>Make Sure You Attach Successful Payment Screenshot</p>
                      </div>
                      <div className="deposit-options">
                        <div className="bank-detail">
                          <div className="payment-detail-box">
                            <p>
                              {selectedAccount.upiId}
                              <span className="ml-auto">
                                <i
                                  className="fas fa-copy mr-1"
                                  onClick={() => copytoclipboard(selectedAccount.upiId)}
                                />
                              </span>
                            </p>
                          </div>
                          <div className="text-center qr-code">
                            <PaymentQRCode
                              upiId={selectedAccount.upiId}
                              name={selectedAccount.upiName}
                              amount={amount}
                              transactionId={generateTransactionId()}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Section */}
                  <div className="payment-icons" style={{ width: "100%" }}>
                    <div className="glass" />
                    <div className="content">
                      <div className="payment-icons-title">
                        <h4 className="mb-0 text-center">
                          <span>Bank Account</span>
                        </h4>
                      </div>
                      <div className="deposit-options">
                        <div className="bank-detail">
                          <div className="payment-detail-box">
                            <p>
                              Account Name:{selectedAccount.accountHolderName}
                              <i
                                className="fas fa-copy mr-1"
                                onClick={() => copytoclipboard(selectedAccount.accountHolderName)}
                              />
                            </p>
                          </div>
                          <div className="payment-detail-box">
                            <p>
                              A/c No.{selectedAccount.accountNumber}
                              <i
                                className="fas fa-copy mr-1"
                                onClick={() => copytoclipboard(selectedAccount.accountNumber)}
                              />
                            </p>
                          </div>
                          <div className="payment-detail-box">
                            <p>
                              IFSC Code:{selectedAccount.ifscCode}
                              <i
                                className="fas fa-copy mr-1"
                                onClick={() => copytoclipboard(selectedAccount.ifscCode)}
                              />
                            </p>
                          </div>
                          <div className="payment-detail-box">
                            <p>
                              Bank Name :{selectedAccount.bankName}
                              <i
                                className="fas fa-copy mr-1"
                                onClick={() => copytoclipboard(selectedAccount.bankName)}
                              />
                            </p>
                          </div>
                          <small>(Range: 100 - 100000)</small>
                        </div>
                      </div>

                      {/* UTR Input */}
                      <div className="col-lg-12" style={{ padding: "7px" }}>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter UTR No"
                          {...register("utrno")}
                          value={preview.utrno || ""}
                          disabled={!(amount && Number(amount) > 0)}
                          onChange={(e) => handleUploadedUTR(e, "bank")}
                        />
                      </div>

                      {/* File Upload + Submit */}
                      <div className="p-2 w-100 gap-2 align-items-center justify-content-between">
                        <div
                          className={`upload-ss ${amount && Number(amount) > 0 ? "" : "pay-disable"}`}
                        >
                          <input
                            type="file"
                            id="upload-14624"
                            // @ts-expect-error
                            disabled={`${amount && Number(amount) > 0 ? "" : "disabled"}`}
                            // @ts-expect-error
                            hidden="hidden"
                            accept="image/png, image/jpg, image/jpeg"
                            {...register("imageUrl")}
                            onChange={(e) => handleUploadedFile(e, "bank")}
                          />
                          <label htmlFor="upload-14624">
                            <i className="fas fa-plus-circle mr-1" />
                            Choose File
                          </label>
                        </div>

                        <div className="custom-control mt-2 mb-2 custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            name="terms_condition"
                            id="termsCheck185350"
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="termsCheck185350"
                          >
                            I have read and agree with{" "}
                            <a
                              href="#"
                              data-toggle="modal"
                              data-target="#termsAndCondition"
                              className="terms-condition"
                            >
                              the terms of payment and withdrawal policy.
                            </a>
                          </label>
                        </div>

                        <button
                          className="payment-pay-now d-flex flex-wrap justify-content-center bg-success text-white"
                          type="submit"
                        >
                          <div className="w-100 text-center">
                            <span>Submit</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div
                  className="card-body text-left"
                  style={{ fontSize: "13px", color: "red" }}
                >
                  <p className="mb-3">
                    1. Deposit money only in the below available accounts to get
                    the fastest credits and avoid possible delays.
                  </p>
                  <p className="mb-3">
                    2. Deposits made 45 minutes after the account removal from
                    the site are valid &amp; will be added to their wallets.
                  </p>
                  <p className="mb-3">
                    3. Site is not responsible for money deposited to Old,
                    Inactive or Closed accounts.
                  </p>
                  <p className="mb-3">
                    4. After deposit, add your UTR and amount to receive
                    balance.{" "}
                  </p>
                  <p className="mb-3">
                    5. NEFT receiving time varies from 40 minutes to 2 hours.{" "}
                  </p>
                  <p className="mb-3">
                    6. In case of account modification: payment valid for 1 hour
                    after changing account details in deposit page.{" "}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DepositStatement2 />
        </div>
      </div>
    </div>
  );
};

export default Deposit;
