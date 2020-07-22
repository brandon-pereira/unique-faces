# Unique Faces

`unique-faces` is a node module that assists in detecting unknown sets of faces across multiple photos.

## API

### Create an instance

```js
import UniqueFaces from "unique-faces";

// all state is stored inside a unique faces instance
const uniqueFaces = new UniqueFaces();
```

### `init`

Init function will load in all the required tensorflow libraries and also
prepare the GPU for processing

```js
/**
 * Note: This returns a promise, you can either
 * initialize it manually (prewarm it) or you can skip
 * this step and it will be called on before the first image
 * is processed
 */
await uniqueFaces.init();
```

### `findAllUniqueFaces`

Method which takes an image **path** and finds all the unique faces
inside the photo. If this is a sequential call of this function,
it could match on an existing photo.

```js
const images [
    "./IMG_101.jpg",
    "./IMG_200.jpg"
];

for (let imgPath of images) {
    await faceDetection.findAllUniqueFaces(imgPath);
}
```

### `export`

Take the training data generated and export it to JSON

```js
await faceDetection.export();
```

### TODO

- Auto initialization
- Ensure no tf logic ran till init called
- Option for thumbnailPath
- Option for outputPath
