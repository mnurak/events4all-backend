function setupChangeStream(model, modelName, onChange) {
  const changeStream = model.watch();

  changeStream.on("change", (change) => {
    onChange(change);
  });
  changeStream.on("error", (err) => {
    console.error(`[${modelName}] Change stream error:`, err);
  });
}

module.exports = setupChangeStream;
