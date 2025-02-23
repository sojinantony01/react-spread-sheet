import fs from "fs"

const replaceWordInFile = (filePath, oldWord, newWord) => {
  const data = fs.readFileSync(filePath, 'utf8');
  const newData = data.replace(new RegExp(oldWord, 'g'), newWord);
  fs.writeFileSync(filePath, newData);
};

replaceWordInFile('src/App.tsx', './lib', 'react-spread-sheet-excel');