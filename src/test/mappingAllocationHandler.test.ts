import { subqlTest } from "@subql/testing";
import { Allocations } from "../types";
import allocationJson from "./mock/allocation.json";

// See https://academy.subquery.network/build/testing.html

subqlTest(
  "mappingAllocationHandler test",
  3259478,
  [],
  [
    Allocations.create({
        ...JSON.parse(JSON.stringify(allocationJson)).data.allocations.nodes[0],
    })
  ],
  "handleAllocationBatchCall"
);