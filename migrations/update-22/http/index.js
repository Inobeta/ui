"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { MigrationError } = require("../lib/engine");

const PAYLOAD_ROOT = path.join(__dirname, "..", "files", "http");
const DEST_ROOT = "/src/app/core/http";

const HTTP_SYMBOLS = [
  "IbSession", "IbUserLogin", "IbAuthTypes", "IbAPITokens",
  "IbAuthGuard", "IbLoginGuard", "IbRoleGuard",
  "IbLoginService",
  "IbSpinnerLoadingComponent",
  "ibCrudToast",
  "IbHttpModule",
  "IbHttpTestModule",
  "IbLoadingSkeletonRectComponent",
  "IbLoadingSkeletonContainerComponent",
  "IbLoadingDirective",
  "IbRoleCheckDirective",
  "IHttpStore", "ibHttpEffects",
  "ibSessionFeature", "ibLoaderFeature",
  "ibSelectAccessTokenExp", "ibSelectActiveSession", "ibSelectDecodedData",
  "ibSelectIsHttpLoading", "ibSelectIsHttpUrlLoading",
  "ibHttpReducers",
  "IbLoaderState", "ibRequestHttp",
  "IbSessionState",
  "ibLoaderActions", "ibAuthActions",
  "ibLoaderExtraSelectors", "IbSessionEffects",
  "ibLoaderReducerMain", "ibSessionReducerMain",
  "IbLoadingStubDirective", "SpinnerLoadingStubComponent",
];

function loadPayload(payloadRoot) {
  const root = payloadRoot || PAYLOAD_ROOT;
  const payload = {};
  const walk = (dir, consumerBase) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const consumerPath = path.posix.join(consumerBase, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, consumerPath);
      } else {
        payload[consumerPath] = fs.readFileSync(fullPath, "utf8");
      }
    }
  };
  walk(root, DEST_ROOT);
  return payload;
}

function prepareJwtDecodeDependency(tree) {
  const pkgPath = "/package.json";
  const existing = tree.read(pkgPath);
  if (!existing) {
    return [];
  }

  let pkg;
  try {
    pkg = JSON.parse(tree.readText(pkgPath));
  } catch (error) {
    throw new MigrationError("Preflight failed for HTTP", [
      { file: pkgPath, message: `invalid package.json: ${error.message}` },
    ]);
  }
  if (!pkg || typeof pkg !== "object" || Array.isArray(pkg)) {
    throw new MigrationError("Preflight failed for HTTP", [
      { file: pkgPath, message: "package.json must contain an object" },
    ]);
  }
  if (pkg.dependencies !== undefined && (!pkg.dependencies || typeof pkg.dependencies !== "object" || Array.isArray(pkg.dependencies))) {
    throw new MigrationError("Preflight failed for HTTP", [
      { file: pkgPath, message: "package.json dependencies must contain an object" },
    ]);
  }
  const deps = pkg.dependencies || {};
  if (deps["jwt-decode"]) {
    return [];
  }
  deps["jwt-decode"] = "^4.0.0";
  pkg.dependencies = deps;
  return [{ path: pkgPath, content: JSON.stringify(pkg, null, 2) + "\n" }];
}

function createHttpFamily(payloadRoot) {
  return {
    name: "HTTP",
    symbols: HTTP_SYMBOLS,
    destination: `${DEST_ROOT}/index.ts`,
    payload: loadPayload(payloadRoot),
    prepare: prepareJwtDecodeDependency,
    prompt: "The HTTP module is being removed from @inobeta/ui. Vendor it locally to src/app/core/http/?",
  };
}

module.exports = {
  HTTP_SYMBOLS,
  DEST_ROOT,
  loadPayload,
  prepareJwtDecodeDependency,
  createHttpFamily,
};
