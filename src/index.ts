import "./linq-static.js";
import "./util.js";
import Linq from "./linq.js";

import "./prototype/callbacks.js";
import "./prototype/collection.js";
import "./prototype/distinct.js";
import "./prototype/find.js";
import "./prototype/group.js";
import "./prototype/join.js";
import "./prototype/math.js";
import "./prototype/misc.js";
import "./prototype/query.js";
import "./prototype/sort.js";
import "./prototype/zip.js";

export * from "./linq.js";
export type { Select, BiSelect, Comparer, Predictate, PredictateTyped } from "./util.js";
export default Linq;