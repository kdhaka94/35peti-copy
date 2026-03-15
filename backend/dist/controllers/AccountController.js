"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountController = void 0;
const mongoose_1 = require("mongoose");
const AccountStatement_1 = require("../models/AccountStatement");
const Balance_1 = require("../models/Balance");
const UserChip_1 = require("../models/UserChip");
const ApiController_1 = require("./ApiController");
const aggregation_pipeline_pagination_1 = require("../util/aggregation-pipeline-pagination");
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const user_socket_1 = __importDefault(require("../sockets/user-socket"));
const Operation_1 = __importDefault(require("../models/Operation"));
class AccountController extends ApiController_1.ApiController {
    constructor() {
        super();
        this.calculatepnl = (userId, type = 'W') => __awaiter(this, void 0, void 0, function* () {
            // const parent = await User.findOne(
            //   {
            //     parentStr: { $elemMatch: { $eq: Types.ObjectId(userId) } },
            //     role: RoleType.user,
            //   },
            //   { _id: 1 },
            // )
            //   .distinct('_id')
            //   .lean()
            // if (user.role == RoleType.user) {
            //   parent.push(userId)
            // }
            // const pnl = await AccoutStatement.aggregate([
            //   { $match: { userId: { $in: parent }, betId: { $ne: null } } },
            //   {
            //     $group: {
            //       _id: null,
            //       totalAmount: { $sum: '$amount' },
            //     },
            //   },
            // ]);
            const bal = yield Balance_1.Balance.findOne({ userId: userId }).select({ profitLoss: 1 });
            // const withdrawlsum = await AccoutStatement.aggregate([
            //   {
            //     $match: {
            //       userId: Types.ObjectId(userId),
            //       betId: { $eq: null },
            //       txnId: { $eq: null },
            //       txnType: TxnType.dr,
            //     },
            //   },
            //   {
            //     $group: {
            //       _id: null,
            //       totalAmount: { $sum: '$amount' },
            //     },
            //   },
            // ])
            // const withdAmt = withdrawlsum && withdrawlsum.length > 0 ? withdrawlsum[0].totalAmount : 0
            // //const pnl_ = pnl && pnl.length > 0 ? pnl[0].totalAmount + withdAmt : 0
            // const pnl_ = bal?.profitLoss ? bal?.profitLoss + withdAmt : 0
            return (bal === null || bal === void 0 ? void 0 : bal.profitLoss) ? bal === null || bal === void 0 ? void 0 : bal.profitLoss : 0;
        });
        // settelement2 = async (req: Request, res: Response) => {
        //   console.log(req.body, "data from settlement");
        //   const { username } = req.body;
        //   const user_data = await User.findOne({username})
        //   if (!username) {
        //     return this.fail(res, "Username is required");
        //   }
        //   try {
        //   if(username == "superadmin"){
        //      const operations = await Operation
        //       .find()
        //       .sort({ createdAt: -1 });
        //     if (!operations || operations.length === 0) {
        //       return this.success(res, {
        //         msg: "No operations found for this username",
        //         operations: []
        //       });
        //     }
        //     return this.success(res, {
        //       msg: "Success",
        //       operations
        //     });
        //   }
        //   if(user_data.role != "user"){
        //   }
        //     const operations = await Operation
        //       .find({ username })
        //       .sort({ createdAt: -1 });
        //     if (!operations || operations.length === 0) {
        //       return this.success(res, {
        //         msg: "No operations found for this username",
        //         operations: []
        //       });
        //     }
        //     return this.success(res, {
        //       msg: "Success",
        //       operations
        //     });
        //   } catch (error: any) {
        //     console.error(error);
        //     return this.fail(res, "Server error: " + error.message);
        //   }
        // };
        this.settelement2 = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { username } = req.body;
                if (!username) {
                    return this.fail(res, "Username is required");
                }
                const user_data = yield User_1.User.findOne({ username });
                if (!user_data) {
                    return this.fail(res, "User not found");
                }
                // 🔹 SUPER ADMIN → ALL OPERATIONS
                if (username === "superadmin") {
                    const operations = yield Operation_1.default.find().sort({ createdAt: -1 });
                    return this.success(res, {
                        msg: operations.length ? "Success" : "No operations found",
                        operations,
                    });
                }
                // 🔹 NORMAL USER → ONLY OWN OPERATIONS
                if (user_data.role === "user") {
                    const operations = yield Operation_1.default
                        .find({ username })
                        .sort({ createdAt: -1 });
                    return this.success(res, {
                        msg: operations.length ? "Success" : "No operations found",
                        operations,
                    });
                }
                // 🔹 AGENT / ADMIN / MASTER etc.
                // 👉 find child users whose parentStr contains current user _id
                const childUsers = yield User_1.User.find({
                    parentStr: user_data._id,
                }).select("username");
                // collect usernames (children + self)
                const usernames = [
                    user_data.username,
                    ...childUsers.map((u) => u.username),
                ];
                const operations = yield Operation_1.default
                    .find({ username: { $in: usernames } })
                    .sort({ createdAt: -1 });
                return this.success(res, {
                    msg: operations.length ? "Success" : "No operations found",
                    operations,
                });
            }
            catch (error) {
                console.error(error);
                return this.fail(res, "Server error: " + error.message);
            }
        });
        this.getUserBalanceWithExposer = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const bal = yield Balance_1.Balance.findOne({ userId: user._id })
                    .select({
                    balance: 1,
                    exposer: 1,
                    casinoexposer: 1,
                })
                    .lean();
                bal.exposer = (bal === null || bal === void 0 ? void 0 : bal.exposer) + ((bal === null || bal === void 0 ? void 0 : bal.casinoexposer) || 0);
                return this.success(res, bal);
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.depositWithdraw = (req, { role, _id }) => __awaiter(this, void 0, void 0, function* () {
            let { userId, parentUserId, amount, balanceUpdateType } = req.body;
            const parentBal = yield Balance_1.Balance.findOne({ userId: mongoose_1.Types.ObjectId(parentUserId) });
            // const userData = await User.findOne({
            //   parentStr: { $elemMatch: { $eq: Types.ObjectId(parentUserId) } },
            //   _id: Types.ObjectId(userId),
            // })
            if (balanceUpdateType == 'ST') {
                if (amount > 0) {
                    balanceUpdateType = 'D';
                }
                else {
                    amount = Math.abs(amount);
                    balanceUpdateType = 'W';
                }
            }
            const select = {
                _id: 1,
                username: 1,
                parent: 1,
            };
            let userData = yield User_1.User.aggregate([
                {
                    $match: {
                        _id: mongoose_1.Types.ObjectId(userId),
                        parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(parentUserId) } },
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'parentId',
                        foreignField: '_id',
                        pipeline: [{ $project: select }],
                        as: 'parent',
                    },
                },
                {
                    $unwind: '$parent',
                },
                {
                    $project: select,
                },
            ]);
            userData = userData.length > 0 ? userData[0] : { _id: null };
            if (!(userData === null || userData === void 0 ? void 0 : userData._id) && role !== Role_1.RoleType.admin) {
                throw Error('Not a valid parent');
            }
            if (balanceUpdateType === 'D' &&
                parentBal.balance - parentBal.exposer < amount &&
                role !== Role_1.RoleType.admin) {
                throw Error('Insufficient amount');
            }
            let userAccBal;
            let successMsg;
            if (role === 'admin' && userId == _id) {
                if (balanceUpdateType === 'D') {
                    userAccBal = yield this.depositAdminAccountBalance(req, userData);
                    successMsg = 'Amount deposited to user';
                }
                else if (balanceUpdateType === 'W') {
                    userAccBal = yield this.withdrawAdminAccountBalance(req, userData);
                    successMsg = 'Successfully withdrawl of amount';
                }
            }
            else {
                if (balanceUpdateType === 'D') {
                    userAccBal = yield this.depositAccountBalance(req, userData);
                    successMsg = 'Amount deposited to user';
                }
                else if (balanceUpdateType === 'W') {
                    const { userId, amount } = req.body;
                    console.log('amount', amount);
                    const getBalWithExp = yield Balance_1.Balance.findOne({ userId });
                    if (getBalWithExp.balance - getBalWithExp.exposer < amount) {
                        throw Error('Insufficient amount to withdrawal, Due to pending exposure or less amount');
                    }
                    userAccBal = yield this.withdrawAccountBalance(req, userData);
                    successMsg = 'Successfully withdrawal of amount';
                }
            }
            user_socket_1.default.setExposer({
                balance: userAccBal,
                userId: userId,
            });
            const pnlData = yield this.calculatepnl(userId, balanceUpdateType);
            return {
                successMsg,
                userAccBal,
                pnlData,
            };
        });
        // getAccountStmtList = async (req: Request, res: Response) => {
        //   try {
        //     const { page }: any = req.query
        //     const { startDate, endDate, reportType, userId, gameId }: any = req.body
        //     console.log(req.body)
        //     const user: any = req.user
        //     const options = {
        //       page: page ? page : 1,
        //       limit: 20,
        //     }
        //     const userid = userId ? Types.ObjectId(userId) : Types.ObjectId(user._id)
        //     var filter: any = {
        //       userId: userid,
        //       createdAt: {
        //         $gte: new Date(`${startDate} 00:00:00`),
        //         $lte: new Date(`${endDate} 23:59:59`),
        //       },
        //     }
        //     if (reportType === "cgame" && ! gameId) {
        //       filter = {
        //         ...filter,
        //         betId: { $ne: null },
        //         sportId: 5000,
        //         // matchId: parseInt(gameId)
        //       };
        //     }
        //      if (reportType === "cgame" && gameId !== "" && gameId ) {
        //       filter = {
        //         ...filter,
        //         betId: { $ne: null },
        //         sportId: 5000,
        //         matchId: parseInt(gameId)
        //       };
        //     }
        //     // if (reportType == "cgame") {
        //     //   filter = {
        //     //     ...filter,
        //     //     betId: { $ne: null },
        //     //     sportId: 5000
        //     //   };
        //     // }
        //     if (reportType === "sgame" && gameId !== "" && gameId) {
        //       filter = {
        //         ...filter,
        //         betId: { $ne: null },
        //         sportId: {
        //           $ne: 5000,
        //           $eq: parseInt(gameId)
        //         }
        //       };
        //     }
        //     else if (reportType === "sgame") {
        //       console.log("hello world")
        //       filter = {
        //         ...filter,
        //         betId: { $ne: null },
        //         sportId: {
        //           $ne: 5000,
        //           // $eq: parseInt(gameId)
        //         }
        //         // sportId: 5000,
        //       };
        //     }
        //     if (reportType == 'chip') {
        //       filter = { ...filter, ...{ betId: null } }
        //     }
        //     const matchfilter = {
        //       $match: filter,
        //     }
        //     const aggregateFilter = [
        //       {
        //         $addFields: {
        //           convertedId: {
        //             $toObjectId: '$betId',
        //           },
        //         },
        //       },
        //       {
        //         $lookup: {
        //           from: 'bets',
        //           localField: 'convertedId',
        //           foreignField: '_id',
        //           as: 'result',
        //         },
        //       },
        //       matchfilter,
        //       {
        //         $facet: {
        //           nonNullSelections: [
        //             {
        //               $match: {
        //                 convertedId: { $ne: null },
        //               },
        //             },
        //             {
        //               $group: {
        //                 _id: {
        //                   matchId: '$matchId',
        //                   marketId: '$result.marketId',
        //                 },
        //                 userId: { $first: '$userId' },
        //                 selectionId: { $first: '$selectionId' },
        //                 matchId: { $first: '$matchId' },
        //                 amount: { $sum: '$amount' },
        //                 txnType: { $first: '$txnType' },
        //                 txnBy: { $first: '$txnBy' },
        //                 openBal: { $first: '$openBal' },
        //                 narration: { $first: '$narration' },
        //                 createdAt: { $first: '$createdAt' },
        //                 type: { $first: '$type' },
        //                 allBets: { $push: '$$ROOT' },
        //               },
        //             },
        //           ],
        //           nullSelections: [
        //             {
        //               $match: {
        //                 convertedId: null,
        //               },
        //             },
        //           ],
        //         },
        //       },
        //       {
        //         $sort: { createdAt: 1 },
        //       },
        //       {
        //         $project: {
        //           data: {
        //             $concatArrays: ['$nonNullSelections', '$nullSelections'],
        //           },
        //         },
        //       },
        //       {
        //         $unwind: '$data',
        //       },
        //       {
        //         $replaceRoot: {
        //           newRoot: '$data',
        //         },
        //       },
        //       {
        //         $sort: {
        //           createdAt: 1, // or -1 for descending order
        //         },
        //       },
        //     ]
        //     const pageNo = page ? (page as string) : '1'
        //     var accountStatement = await AccoutStatement.aggregate(aggregateFilter)
        //     const datasort = accountStatement?.sort((a: any, b: any) => a.createdAt - b.createdAt)
        //     var accountStatementNew = { items: datasort }
        //     // console.log(accountStatement, "FGHJO")
        //     const openingBalance = await AccoutStatement.aggregate([
        //       {
        //         $match: {
        //           userId: userid,
        //           createdAt: {
        //             $lte: new Date(`${startDate} 00:00:00`),
        //           },
        //         },
        //       },
        //       {
        //         $group: {
        //           _id: null,
        //           total: { $sum: '$amount' },
        //         },
        //       },
        //     ])
        //     return this.success(res, {
        //       ...accountStatementNew,
        //       openingBalance: openingBalance?.[0]?.total || 0,
        //     })
        //   } catch (e: any) {
        //     return this.fail(res, e)
        //   }
        // }
        this.getAccountStmtList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            try {
                const { page = 1 } = req.query;
                const { startDate, endDate, reportType, userId, gameId } = req.body;
                const limit = 20;
                const skip = (Number(page) - 1) * limit;
                const user = req.user;
                const userid = userId ? mongoose_1.Types.ObjectId(userId) : mongoose_1.Types.ObjectId(user._id);
                let filter = {
                    userId: userid,
                    createdAt: {
                        $gte: new Date(`${startDate} 00:00:00`),
                        $lte: new Date(`${endDate} 23:59:59`),
                    },
                };
                // ===== CASINO GAME =====
                if (reportType === "cgame") {
                    filter.betId = { $ne: null };
                    filter.sportId = 5000;
                    if (gameId) {
                        filter.matchId = parseInt(gameId);
                    }
                }
                // ===== SPORTS GAME =====
                if (reportType === "sgame") {
                    filter.betId = { $ne: null };
                    filter.sportId = { $ne: 5000 };
                    if (gameId) {
                        filter.sportId = parseInt(gameId);
                    }
                }
                // ===== CHIP =====
                if (reportType === "chip") {
                    filter.betId = null;
                }
                const aggregatePipeline = [
                    {
                        $addFields: {
                            convertedId: {
                                $cond: [
                                    { $and: [{ $ne: ["$betId", null] }, { $ne: ["$betId", ""] }] },
                                    { $toObjectId: "$betId" },
                                    null
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "bets",
                            localField: "convertedId",
                            foreignField: "_id",
                            as: "result"
                        }
                    },
                    { $match: filter },
                    {
                        $facet: {
                            data: [
                                { $sort: { createdAt: -1 } },
                                { $skip: skip },
                                { $limit: limit }
                            ],
                            totalCount: [
                                { $count: "count" }
                            ]
                        }
                    }
                ];
                const result = yield AccountStatement_1.AccoutStatement.aggregate(aggregatePipeline);
                const items = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.data) || [];
                const total = ((_d = (_c = (_b = result[0]) === null || _b === void 0 ? void 0 : _b.totalCount) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.count) || 0;
                // ===== OPENING BALANCE =====
                const openingBalance = yield AccountStatement_1.AccoutStatement.aggregate([
                    {
                        $match: {
                            userId: userid,
                            createdAt: { $lt: new Date(`${startDate} 00:00:00`) }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$amount" }
                        }
                    }
                ]);
                return this.success(res, {
                    items,
                    page: Number(page),
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    openingBalance: ((_e = openingBalance === null || openingBalance === void 0 ? void 0 : openingBalance[0]) === null || _e === void 0 ? void 0 : _e.total) || 0
                });
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.profitloss = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { page } = req.query;
                const { startDate, endDate, userId } = req.body;
                const pageNo = page ? page : '1';
                const user = req.user;
                const aggregateFilter = [
                    {
                        $group: {
                            _id: '$matchId',
                            total: { $sum: '$amount' },
                            narration: { $first: '$narration' },
                            type: { $first: '$type' },
                            sportId: { $first: '$sportId' },
                        },
                    },
                ];
                var filter = {
                    userId: userId ? mongoose_1.Types.ObjectId(userId) : mongoose_1.Types.ObjectId(user._id),
                    betId: { $ne: null },
                    createdAt: {
                        $gte: new Date(`${startDate} 00:00:00`),
                        $lte: new Date(`${endDate} 23:59:59`),
                    },
                };
                const matchfilter = {
                    $match: filter,
                };
                const accountStatement = yield AccountStatement_1.AccoutStatement.aggregate((0, aggregation_pipeline_pagination_1.paginationPipeLine)(pageNo, [matchfilter, ...aggregateFilter]));
                return this.success(res, Object.assign({}, accountStatement[0]));
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
        this.saveUserDepositFC = this.saveUserDepositFC.bind(this);
        this.saveUserDepositFCByStaff = this.saveUserDepositFCByStaff.bind(this);
    }
    saveUserDepositFC(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, parentUserId, amount, narration, balanceUpdateType, transactionPassword } = req.body;
                const { _id, role } = req === null || req === void 0 ? void 0 : req.user;
                const parentBal = yield Balance_1.Balance.findOne({ userId: mongoose_1.Types.ObjectId(parentUserId) });
                // const userData = await User.findOne({
                //   parentStr: { $elemMatch: { $eq: Types.ObjectId(parentUserId) } },
                //   _id: Types.ObjectId(userId),
                // })
                const select = {
                    _id: 1,
                    username: 1,
                    parent: 1,
                };
                let userData = yield User_1.User.aggregate([
                    {
                        $match: {
                            _id: mongoose_1.Types.ObjectId(userId),
                            parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(parentUserId) } },
                        },
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'parentId',
                            foreignField: '_id',
                            pipeline: [{ $project: select }],
                            as: 'parent',
                        },
                    },
                    {
                        $unwind: '$parent',
                    },
                    {
                        $project: select,
                    },
                ]);
                userData = userData.length > 0 ? userData[0] : { _id: null };
                if (!(userData === null || userData === void 0 ? void 0 : userData._id) && role !== Role_1.RoleType.admin) {
                    return this.fail(res, 'Not a valid parent');
                }
                if (balanceUpdateType === 'D' &&
                    parentBal.balance - parentBal.exposer < amount &&
                    role !== Role_1.RoleType.admin) {
                    return this.fail(res, 'Insufficient amount');
                }
                const currentUserData = yield User_1.User.findOne({ _id });
                return yield currentUserData
                    .compareTxnPassword(transactionPassword)
                    .then((isMatch) => __awaiter(this, void 0, void 0, function* () {
                    if (!isMatch) {
                        return this.fail(res, 'Transaction Password not matched');
                    }
                    let userAccBal;
                    let successMsg;
                    if (role === 'admin' && userId == _id) {
                        if (balanceUpdateType === 'D') {
                            userAccBal = yield this.depositAdminAccountBalance(req, userData);
                            successMsg = 'Amount deposited to user';
                        }
                        else if (balanceUpdateType === 'W') {
                            userAccBal = yield this.withdrawAdminAccountBalance(req, userData);
                            successMsg = 'Successfully withdrawl of amount';
                        }
                    }
                    else {
                        if (balanceUpdateType === 'D') {
                            userAccBal = yield this.depositAccountBalance(req, userData);
                            successMsg = 'Amount deposited to user';
                        }
                        else if (balanceUpdateType === 'W') {
                            const { userId, amount } = req.body;
                            const getBalWithExp = yield Balance_1.Balance.findOne({ userId });
                            if (getBalWithExp.balance - getBalWithExp.exposer < amount) {
                                return this.fail(res, 'Insufficient amount to withdrawl');
                            }
                            userAccBal = yield this.withdrawAccountBalance(req, userData);
                            successMsg = 'Successfully withdrawl of amount';
                        }
                    }
                    user_socket_1.default.setExposer({
                        balance: userAccBal,
                        userId: userId,
                    });
                    const pnlData = yield this.calculatepnl(userId, balanceUpdateType);
                    return this.success(res, { balance: userAccBal, profitLoss: pnlData }, successMsg);
                }));
            }
            catch (e) {
                return this.fail(res, e);
            }
        });
    }
    saveUserDepositFCByStaff(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, parentUserId, amount, narration, transactionPassword, balanceUpdateType, } = req.body;
                // const { _id, role }: any = req?.user
                console.log(req.body, "helo world aaaja");
                const parentBal = yield Balance_1.Balance.findOne({ userId: mongoose_1.Types.ObjectId(parentUserId) });
                // const userData = await User.findOne({
                //   parentStr: { $elemMatch: { $eq: Types.ObjectId(parentUserId) } },
                //   _id: Types.ObjectId(userId),
                // })
                const select = {
                    _id: 1,
                    username: 1,
                    parent: 1,
                };
                let userData = yield User_1.User.aggregate([
                    {
                        $match: {
                            _id: mongoose_1.Types.ObjectId(userId),
                            parentStr: { $elemMatch: { $eq: mongoose_1.Types.ObjectId(parentUserId) } },
                        },
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'parentId',
                            foreignField: '_id',
                            pipeline: [{ $project: select }],
                            as: 'parent',
                        },
                    },
                    {
                        $unwind: '$parent',
                    },
                    {
                        $project: select,
                    },
                ]);
                userData = userData.length > 0 ? userData[0] : { _id: null };
                if (!(userData === null || userData === void 0 ? void 0 : userData._id)) {
                    return this.fail(res, 'Not a valid parent');
                }
                if (balanceUpdateType === 'D' &&
                    parentBal.balance - parentBal.exposer < amount) {
                    return this.fail(res, 'Insufficient amount');
                }
                const currentUserData = yield User_1.User.findOne({ _id: mongoose_1.Types.ObjectId(parentUserId) });
                return yield currentUserData
                    .compareTxnPassword(transactionPassword)
                    .then((isMatch) => __awaiter(this, void 0, void 0, function* () {
                    if (false) {
                        return this.fail(res, 'Transaction Password not matched');
                    }
                    let userAccBal;
                    let successMsg;
                    if (userId == parentUserId) {
                        if (balanceUpdateType === 'D') {
                            userAccBal = yield this.depositAdminAccountBalance(req, userData);
                            successMsg = 'Amount deposited to user';
                        }
                        else if (balanceUpdateType === 'W') {
                            userAccBal = yield this.withdrawAdminAccountBalance(req, userData);
                            successMsg = 'Successfully withdrawl of amount';
                        }
                    }
                    else {
                        if (balanceUpdateType === 'D') {
                            userAccBal = yield this.depositAccountBalancetwo(req, userData);
                            successMsg = 'Amount deposited to user';
                        }
                        else if (balanceUpdateType === 'W') {
                            const { userId, amount } = req.body;
                            const getBalWithExp = yield Balance_1.Balance.findOne({ userId });
                            if (getBalWithExp.balance - getBalWithExp.exposer < amount) {
                                return this.fail(res, 'Insufficient amount to withdrawl');
                            }
                            userAccBal = yield this.withdrawAccountBalancetwo(req, userData);
                            successMsg = 'Successfully withdrawl of amount';
                        }
                    }
                    user_socket_1.default.setExposer({
                        balance: userAccBal,
                        userId: userId,
                    });
                    const pnlData = yield this.calculatepnl(userId, balanceUpdateType);
                    return this.success(res, { balance: userAccBal, profitLoss: pnlData }, successMsg);
                }));
            }
            catch (e) {
                console.log(e, "GHJKL");
                return this.fail(res, e);
            }
        });
    }
    depositAdminAccountBalance(req, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id, username } = req === null || req === void 0 ? void 0 : req.user;
            let userAccBal;
            const { amount, narration } = req.body;
            const getAccStmt = yield AccountStatement_1.AccoutStatement.findOne({ userId: _id }, null, {
                sort: { createdAt: -1 },
            });
            const getOpenBal = (getAccStmt === null || getAccStmt === void 0 ? void 0 : getAccStmt.closeBal) ? getAccStmt.closeBal : 0;
            const accountData = {
                userId: _id,
                narration,
                amount,
                type: AccountStatement_1.ChipsType.fc,
                txnType: UserChip_1.TxnType.cr,
                openBal: getOpenBal,
                closeBal: getOpenBal + +amount,
                txnBy: `${username}/${userData.username}`,
            };
            const newAccStmt = new AccountStatement_1.AccoutStatement(accountData);
            yield newAccStmt.save();
            if (newAccStmt._id !== undefined && newAccStmt._id !== null) {
                const mbal = yield this.getUserDepWithBalance(_id);
                yield Balance_1.Balance.findOneAndUpdate({ userId: _id }, { balance: newAccStmt.closeBal, mainBalance: mbal }, { new: true, upsert: true });
                userAccBal = newAccStmt.closeBal;
            }
            return userAccBal;
        });
    }
    getUserBalance(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ac = yield AccountStatement_1.AccoutStatement.aggregate([
                { $match: { userId: mongoose_1.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                    },
                },
            ]);
            const Balance_ = ac && ac.length > 0 ? ac[0].totalAmount : 0;
            return Balance_;
        });
    }
    getUserDepWithBalance(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ac = yield AccountStatement_1.AccoutStatement.aggregate([
                { $match: { userId: mongoose_1.Types.ObjectId(userId), type: AccountStatement_1.ChipsType.fc } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                    },
                },
            ]);
            const Balance_ = ac && ac.length > 0 ? ac[0].totalAmount : 0;
            return Balance_;
        });
    }
    depositAccountBalance(req, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, parentUserId, amount, narration } = req.body;
            const { _id, username } = req.user;
            let userAccBal;
            // const getAccStmt = await AccoutStatement.findOne({ userId: userId }, null, {
            //   sort: { createdAt: -1 },
            // })
            const getParentAccStmt = yield AccountStatement_1.AccoutStatement.findOne({ userId: parentUserId }, null, {
                sort: { createdAt: -1 },
            });
            const getOpenBal = yield this.getUserBalance(userId);
            const userAccountData = {
                userId,
                narration,
                amount,
                type: AccountStatement_1.ChipsType.fc,
                txnType: UserChip_1.TxnType.cr,
                openBal: getOpenBal,
                closeBal: getOpenBal + +amount,
                txnBy: `${username}/${userData.parent.username}`, //parent username here
            };
            const newUserAccStmt = new AccountStatement_1.AccoutStatement(userAccountData);
            yield newUserAccStmt.save();
            if (newUserAccStmt._id !== undefined && newUserAccStmt._id !== null) {
                const pnlData = yield this.calculatepnl(userId, 'd');
                const mbal = yield this.getUserDepWithBalance(userId);
                yield Balance_1.Balance.findOneAndUpdate({ userId }, { balance: newUserAccStmt.closeBal, profitLoss: pnlData + +amount, mainBalance: mbal }, { new: true, upsert: true });
                userAccBal = newUserAccStmt.closeBal;
            }
            const getParentOpenBal = (getParentAccStmt === null || getParentAccStmt === void 0 ? void 0 : getParentAccStmt.closeBal) ? getParentAccStmt.closeBal : 0;
            const parentAmt = -amount;
            const parentUserAccountData = {
                userId: parentUserId,
                narration,
                amount: parentAmt,
                type: AccountStatement_1.ChipsType.fc,
                txnType: UserChip_1.TxnType.dr,
                openBal: getParentOpenBal,
                closeBal: getParentOpenBal - +amount,
                txnId: newUserAccStmt._id,
                txnBy: `${username}/${userData.username}`,
            };
            const newParentUserAccStmt = new AccountStatement_1.AccoutStatement(parentUserAccountData);
            yield newParentUserAccStmt.save();
            if (newParentUserAccStmt._id !== undefined && newParentUserAccStmt._id !== null) {
                const mbal = yield this.getUserDepWithBalance(parentUserId);
                yield Balance_1.Balance.findOneAndUpdate({ userId: parentUserId }, { balance: newParentUserAccStmt.closeBal, mainBalance: mbal }, { new: true, upsert: true });
                yield AccountStatement_1.AccoutStatement.updateOne({ _id: mongoose_1.Types.ObjectId(newUserAccStmt._id) }, { $set: { txnId: mongoose_1.Types.ObjectId(newParentUserAccStmt._id) } });
            }
            return userAccBal;
        });
    }
    depositAccountBalancetwo(req, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, parentUserId, amount, narration } = req.body;
            // const { _id, username }: any = req.user
            let userAccBal;
            // const getAccStmt = await AccoutStatement.findOne({ userId: userId }, null, {
            //   sort: { createdAt: -1 },
            // })
            const getParentAccStmt = yield AccountStatement_1.AccoutStatement.findOne({ userId: parentUserId }, null, {
                sort: { createdAt: -1 },
            });
            const getOpenBal = yield this.getUserBalance(userId);
            const userAccountData = {
                userId,
                narration,
                amount,
                type: AccountStatement_1.ChipsType.fc,
                txnType: UserChip_1.TxnType.cr,
                openBal: getOpenBal,
                closeBal: getOpenBal + +amount,
                txnBy: `${"ghjkl"}/${userData.parent.username}`, //parent username here
            };
            const newUserAccStmt = new AccountStatement_1.AccoutStatement(userAccountData);
            yield newUserAccStmt.save();
            if (newUserAccStmt._id !== undefined && newUserAccStmt._id !== null) {
                const pnlData = yield this.calculatepnl(userId, 'd');
                const mbal = yield this.getUserDepWithBalance(userId);
                yield Balance_1.Balance.findOneAndUpdate({ userId }, { balance: newUserAccStmt.closeBal, profitLoss: pnlData + +amount, mainBalance: mbal }, { new: true, upsert: true });
                userAccBal = newUserAccStmt.closeBal;
            }
            const getParentOpenBal = (getParentAccStmt === null || getParentAccStmt === void 0 ? void 0 : getParentAccStmt.closeBal) ? getParentAccStmt.closeBal : 0;
            const parentAmt = -amount;
            const parentUserAccountData = {
                userId: parentUserId,
                narration,
                amount: parentAmt,
                type: AccountStatement_1.ChipsType.fc,
                txnType: UserChip_1.TxnType.dr,
                openBal: getParentOpenBal,
                closeBal: getParentOpenBal - +amount,
                txnId: newUserAccStmt._id,
                txnBy: `${"Payment Done by staff "}/${userData.username}`,
            };
            const newParentUserAccStmt = new AccountStatement_1.AccoutStatement(parentUserAccountData);
            yield newParentUserAccStmt.save();
            if (newParentUserAccStmt._id !== undefined && newParentUserAccStmt._id !== null) {
                const mbal = yield this.getUserDepWithBalance(parentUserId);
                yield Balance_1.Balance.findOneAndUpdate({ userId: parentUserId }, { balance: newParentUserAccStmt.closeBal, mainBalance: mbal }, { new: true, upsert: true });
                yield AccountStatement_1.AccoutStatement.updateOne({ _id: mongoose_1.Types.ObjectId(newUserAccStmt._id) }, { $set: { txnId: mongoose_1.Types.ObjectId(newParentUserAccStmt._id) } });
            }
            return userAccBal;
        });
    }
    withdrawAdminAccountBalance(req, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id, username } = req === null || req === void 0 ? void 0 : req.user;
            const { amount, narration } = req.body;
            let userAccBal;
            const getAccStmt = yield AccountStatement_1.AccoutStatement.findOne({ userId: _id }, null, {
                sort: { createdAt: -1 },
            });
            try {
                if (((getAccStmt === null || getAccStmt === void 0 ? void 0 : getAccStmt._id) !== undefined && (getAccStmt === null || getAccStmt === void 0 ? void 0 : getAccStmt._id) !== null) || getAccStmt !== null) {
                    const getPrevCloseBal = yield this.getUserBalance(_id);
                    const accountData = {
                        userId: _id,
                        narration,
                        amount: -amount,
                        type: AccountStatement_1.ChipsType.fc,
                        txnType: UserChip_1.TxnType.dr,
                        openBal: getPrevCloseBal,
                        closeBal: getPrevCloseBal - +amount,
                        txnBy: `${username}/${userData.username}`,
                    };
                    const newAccStmt = new AccountStatement_1.AccoutStatement(accountData);
                    yield newAccStmt.save();
                    if (newAccStmt._id !== undefined && newAccStmt._id !== null) {
                        const mbal = yield this.getUserDepWithBalance(_id);
                        yield Balance_1.Balance.findOneAndUpdate({ userId: _id }, { balance: newAccStmt.closeBal, mainBalance: mbal }, { new: true, upsert: true });
                        userAccBal = newAccStmt.closeBal;
                    }
                    return userAccBal;
                }
                else {
                    throw Error('Withdrawal is not possible due to unsufficient balance');
                }
            }
            catch (e) {
                throw Error(e.message);
            }
        });
    }
    withdrawAccountBalance(req, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, parentUserId, amount, narration } = req.body;
            const user = req.user;
            let userAccBal;
            const getAccStmt = yield AccountStatement_1.AccoutStatement.findOne({ userId: userId }, null, {
                sort: { createdAt: -1 },
            });
            const getParentAccStmt = yield AccountStatement_1.AccoutStatement.findOne({ userId: parentUserId }, null, {
                sort: { createdAt: -1 },
            });
            if (((getAccStmt === null || getAccStmt === void 0 ? void 0 : getAccStmt._id) !== undefined && (getAccStmt === null || getAccStmt === void 0 ? void 0 : getAccStmt._id) !== null) || getAccStmt !== null) {
                const getPrevCloseBal = yield this.getUserBalance(userId);
                const userAccountData = {
                    userId,
                    narration,
                    amount: -amount,
                    type: AccountStatement_1.ChipsType.fc,
                    txnType: UserChip_1.TxnType.dr,
                    openBal: getPrevCloseBal,
                    closeBal: getPrevCloseBal - +amount,
                    txnBy: `${user.username}/${userData.parent.username}`, //parent username here
                };
                const newUserAccStmt = new AccountStatement_1.AccoutStatement(userAccountData);
                yield newUserAccStmt.save();
                if (newUserAccStmt._id !== undefined && newUserAccStmt._id !== null) {
                    const pnlData = yield this.calculatepnl(userId, 'w');
                    const mbal = yield this.getUserDepWithBalance(userId);
                    yield Balance_1.Balance.findOneAndUpdate({ userId }, { balance: newUserAccStmt.closeBal, profitLoss: pnlData - +amount, mainBalance: mbal }, { new: true, upsert: true });
                    userAccBal = newUserAccStmt.closeBal;
                }
                // Parent checking for balance
                /// const getParentPrevCloseBal = getParentAccStmt?.closeBal ? getParentAccStmt.closeBal : 0
                const getParentPrevCloseBal = yield this.getUserBalance(parentUserId);
                const parentUserAccountData = {
                    userId: parentUserId,
                    narration,
                    amount,
                    type: AccountStatement_1.ChipsType.fc,
                    txnType: UserChip_1.TxnType.cr,
                    openBal: getParentPrevCloseBal,
                    closeBal: getParentPrevCloseBal + +amount,
                    txnBy: `${user.username}/${userData.username}`,
                };
                const newParentUserAccStmt = new AccountStatement_1.AccoutStatement(parentUserAccountData);
                yield newParentUserAccStmt.save();
                if (newParentUserAccStmt._id !== undefined && newParentUserAccStmt._id !== null) {
                    const mbal = yield this.getUserDepWithBalance(parentUserId);
                    yield Balance_1.Balance.findOneAndUpdate({ userId: parentUserId }, { balance: newParentUserAccStmt.closeBal, mainBalance: mbal }, { new: true, upsert: true });
                }
                return userAccBal;
            }
            else {
                throw Error('Withdrawal is not possible due to unsufficient balance');
            }
        });
    }
    withdrawAccountBalancetwo(req, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, parentUserId, amount, narration } = req.body;
            // const user: any = req.user
            let userAccBal;
            const getAccStmt = yield AccountStatement_1.AccoutStatement.findOne({ userId: userId }, null, {
                sort: { createdAt: -1 },
            });
            const getParentAccStmt = yield AccountStatement_1.AccoutStatement.findOne({ userId: parentUserId }, null, {
                sort: { createdAt: -1 },
            });
            if (((getAccStmt === null || getAccStmt === void 0 ? void 0 : getAccStmt._id) !== undefined && (getAccStmt === null || getAccStmt === void 0 ? void 0 : getAccStmt._id) !== null) || getAccStmt !== null) {
                const getPrevCloseBal = yield this.getUserBalance(userId);
                const userAccountData = {
                    userId,
                    narration,
                    amount: -amount,
                    type: AccountStatement_1.ChipsType.fc,
                    txnType: UserChip_1.TxnType.dr,
                    openBal: getPrevCloseBal,
                    closeBal: getPrevCloseBal - +amount,
                    txnBy: `${"Widthdraw done by staff"}/${userData.parent.username}`, //parent username here
                };
                const newUserAccStmt = new AccountStatement_1.AccoutStatement(userAccountData);
                yield newUserAccStmt.save();
                if (newUserAccStmt._id !== undefined && newUserAccStmt._id !== null) {
                    const pnlData = yield this.calculatepnl(userId, 'w');
                    const mbal = yield this.getUserDepWithBalance(userId);
                    yield Balance_1.Balance.findOneAndUpdate({ userId }, { balance: newUserAccStmt.closeBal, profitLoss: pnlData - +amount, mainBalance: mbal }, { new: true, upsert: true });
                    userAccBal = newUserAccStmt.closeBal;
                }
                // Parent checking for balance
                /// const getParentPrevCloseBal = getParentAccStmt?.closeBal ? getParentAccStmt.closeBal : 0
                const getParentPrevCloseBal = yield this.getUserBalance(parentUserId);
                const parentUserAccountData = {
                    userId: parentUserId,
                    narration,
                    amount,
                    type: AccountStatement_1.ChipsType.fc,
                    txnType: UserChip_1.TxnType.cr,
                    openBal: getParentPrevCloseBal,
                    closeBal: getParentPrevCloseBal + +amount,
                    txnBy: `${"widthdraw done by staff"}/${userData.username}`,
                };
                const newParentUserAccStmt = new AccountStatement_1.AccoutStatement(parentUserAccountData);
                yield newParentUserAccStmt.save();
                if (newParentUserAccStmt._id !== undefined && newParentUserAccStmt._id !== null) {
                    const mbal = yield this.getUserDepWithBalance(parentUserId);
                    yield Balance_1.Balance.findOneAndUpdate({ userId: parentUserId }, { balance: newParentUserAccStmt.closeBal, mainBalance: mbal }, { new: true, upsert: true });
                }
                return userAccBal;
            }
            else {
                throw Error('Withdrawal is not possible due to unsufficient balance');
            }
        });
    }
}
exports.AccountController = AccountController;
//# sourceMappingURL=AccountController.js.map