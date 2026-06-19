import assert from "node:assert/strict";
import {
  CONTACT_LEAK_BLOCK_MESSAGE,
  scanTextForContactLeak
} from "../shared/contactGuardCore.mjs";
import { scanTextForProfanity, VULGAR_CONTENT_BLOCK_MESSAGE } from "../shared/profanityFilter.mjs";

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

function mustBlockProfanity(text) {
  assert.equal(
    scanTextForProfanity(text).blocked,
    true,
    `expected profanity block: ${JSON.stringify(text)}`
  );
}

function mustPassProfanity(text) {
  assert.equal(
    scanTextForProfanity(text).blocked,
    false,
    `expected profanity pass: ${JSON.stringify(text)}`
  );
}

assert.equal(
  CONTACT_LEAK_BLOCK_MESSAGE,
  "We couldn't save that information. Please try something different."
);
assert.equal(
  VULGAR_CONTENT_BLOCK_MESSAGE,
  "Please keep your profile friendly — avoid explicit or vulgar language."
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

mustBlockProfanity("Hello whos here for the fuck?");
mustBlockProfanity("here for sex");
mustBlockProfanity("looking for knack");
mustBlockProfanity("send nudes");
mustBlockProfanity("so fucking bored");
mustBlockProfanity("pussy cat"); // blocked by exact term - acceptable false positive for dating bio

mustPassProfanity("I love brunch and beach days");
mustPassProfanity("Looking for something serious");
mustPassProfanity("Good conversation and laughter");

console.log("contact guard tests passed");
