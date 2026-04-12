import { json } from "@sveltejs/kit";
import { g as getState } from "../../../../chunks/colorfield.js";
function GET() {
  return json(getState());
}
export {
  GET
};
