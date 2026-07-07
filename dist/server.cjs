var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var transactions = [
  {
    id: "tx-1",
    type: "send",
    partnerName: "Alex K.",
    partnerEmail: "alex@pulsepay.com",
    amount: 500,
    timestamp: "Today, 14:23",
    status: "Processing",
    token: "USDC",
    networkFee: "Sponsored"
  },
  {
    id: "tx-2",
    type: "receive",
    partnerName: "Sarah Williams",
    partnerEmail: "sarah@mail.com",
    amount: 1250,
    timestamp: "Yesterday, 09:12",
    status: "Completed",
    token: "USDC",
    networkFee: "Sponsored"
  },
  {
    id: "tx-3",
    type: "swap",
    partnerName: "ETH to USDC",
    partnerEmail: "dex@pulsepay.com",
    amount: 450,
    timestamp: "Oct 24, 18:45",
    status: "Completed",
    token: "USDC",
    networkFee: "Sponsored"
  },
  {
    id: "tx-4",
    type: "send",
    partnerName: "Vitalik B.",
    partnerEmail: "vitalik.eth",
    amount: 2500,
    timestamp: "Oct 22, 11:30",
    status: "Completed",
    token: "USDC",
    networkFee: "Sponsored"
  }
];
var contacts = [
  { id: "c-1", name: "Vitalik Buterin", email: "vitalik.eth", initials: "VB" },
  { id: "c-2", name: "Alex Knight", email: "alex@pulsepay.com", initials: "AK" },
  { id: "c-3", name: "Sarah Williams", email: "sarah@mail.com", initials: "SW" },
  { id: "c-4", name: "James Carter", email: "carter@pulsepay.com", initials: "JC" }
];
var userBalance = 14250;
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/transactions", (req, res) => {
    res.json(transactions);
  });
  app.post("/api/transactions", (req, res) => {
    const { type, partnerName, partnerEmail, amount } = req.body;
    if (!type || !partnerEmail || amount === void 0 || isNaN(Number(amount))) {
      return res.status(400).json({ error: "Invalid transaction parameters." });
    }
    const newTx = {
      id: `tx-${Math.random().toString(36).substring(2, 9)}`,
      type,
      partnerName: partnerName || (partnerEmail.includes("@") ? partnerEmail.split("@")[0] : partnerEmail),
      partnerEmail,
      amount: Number(amount),
      timestamp: "Today, " + (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: type === "send" ? "Processing" : "Completed",
      token: "USDC",
      networkFee: "Sponsored"
    };
    transactions = [newTx, ...transactions];
    if (type === "send") {
      userBalance = Math.max(0, userBalance - Number(amount));
    } else {
      userBalance = userBalance + Number(amount);
    }
    res.status(201).json({ transaction: newTx, balance: userBalance });
  });
  app.get("/api/contacts", (req, res) => {
    res.json(contacts);
  });
  app.get("/api/balance", (req, res) => {
    res.json({ balance: userBalance });
  });
  app.post("/api/balance/reset", (req, res) => {
    userBalance = 14250;
    res.json({ balance: userBalance });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Node.js/TypeScript Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
//# sourceMappingURL=server.cjs.map
