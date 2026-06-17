import assert from "node:assert/strict";
import {
  CONTACT_LEAK_BLOCK_MESSAGE,
  scanTextForContactLeak
} from "../shared/contactGuardCore.mjs";

function mustBlock(text) {
  assert.equal(
    scanTextForContactLeak(text).blocked,
    true,
    `expected block: ${JSON.stringify(text)}`
  );
}

function mustPass(text) {
  assert.equal(
    scanTextForContactLeak(text).blocked,
    false,
    `expected pass: ${JSON.stringify(text)}`
  );
}

assert.equal(
  CONTACT_LEAK_BLOCK_MESSAGE,
  "We couldn't save that information. Please try something different."
);

mustBlock("07066621779");
mustBlock("+2348035143299");
mustBlock("WhatsApp me");
mustBlock("Telegram: @john");
mustBlock("IG: stanlex");
mustBlock("gmail.com");
mustBlock("wa.me");
mustBlock("Call me on 08035143299");
mustBlock("zero seven zero six six six two one seven seven nine");
mustBlock("My number is 0803 514 3299");
mustBlock("Suya runs I am interested 07066621779");

mustPass("Suya runs");
mustPass("I love travelling");
mustPass("Tech entrepreneur");
mustPass("Family-oriented");
mustPass("Church community");

console.log("contact guard tests passed");
