#!/usr/bin/env node
import { addProfilePhotos } from "../shared/mainPhoto.mjs";

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function createSerializedQueue() {
  let tail = Promise.resolve();
  return {
    run(task) {
      const next = tail.then(() => task());
      tail = next.then(
        () => undefined,
        () => undefined
      );
      return next;
    }
  };
}

function mergeUploadedProfilePhoto(state, upload) {
  const added = addProfilePhotos(state.photos, state.main, [upload.url]);
  return {
    photos: added.photos,
    main: added.mainPhotoUrl
  };
}

async function simulateConcurrentUploads(count) {
  const queue = createSerializedQueue();
  let state = { photos: [], main: undefined };

  await Promise.all(
    Array.from({ length: count }, (_, index) =>
      (async () => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 20));
        await queue.run(async () => {
          state = mergeUploadedProfilePhoto(state, { url: `https://cdn.test/photo-${index + 1}.jpg` });
        });
      })()
    )
  );

  return state.photos;
}

async function simulateBuggyConcurrentUploads(count) {
  let state = { photos: [], main: undefined };
  const snapshot = { photos: state.photos, main: state.main };
  for (let index = 0; index < count; index += 1) {
    state = mergeUploadedProfilePhoto(snapshot, { url: `https://cdn.test/photo-${index + 1}.jpg` });
  }
  return state.photos;
}

const serializedFive = await simulateConcurrentUploads(5);
assert(serializedFive.length === 5, "serialized queue keeps all 5 uploads");

const serializedTwo = await simulateConcurrentUploads(2);
assert(serializedTwo.length === 2, "serialized queue keeps both uploads");

const buggyFive = await simulateBuggyConcurrentUploads(5);
assert(buggyFive.length === 1, "stale snapshot commits keep only the last upload");

if (failed) process.exit(1);
console.log("photo upload queue tests ok");
