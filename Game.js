"use strict";

import fs from "fs";

export default class GameOfLife {
  constructor(pathFile) {
    const [generations, cols, rows, matrix] = this.getData(pathFile);
    this.generations = generations;
    this.rows = rows;
    this.columns = cols;
    this.matrix = matrix;
  }

  parseMatrix(matrix) {
    return matrix.map((row) =>
      row.split("").map((elem) => (elem.toLowerCase() === "x" ? 1 : 0))
    );
  }

  isValidData(matrix, columns, rows) {
    if (matrix.length !== rows) {
      throw new Error(
        "Invalid input: The number of rows in the matrix doesn`t match the specified rows."
      );
    }

    if (!matrix.every((row) => row.length === columns)) {
      throw new Error(
        "Invalid input: Inconsistent column count in the matrix."
      );
    }
  }

  displayState() {
    console.clear();
    const stringMatrix = this.matrix
      .map((row) => row.map((elem) => (elem === 1 ? "X" : ".")).join(""))
      .join("\n");
    console.log(stringMatrix);
  }

  getData(pathFile) {
    const data = fs.readFileSync(process.cwd() + pathFile, "utf8").split("\n");

    const generations = Number(data[0].trim());

    const [columns, rows] = data[1].split(" ").map(Number);

    let matrix = data.slice(2).map((line) => line.replace(/\r/g, ""));

    this.isValidData(matrix, columns, rows);
    matrix = this.parseMatrix(matrix);

    return [generations, columns, rows, matrix];
  }

  start() {
    const interval = 1000;

    const updateAndDisplay = () => {
      if (this.generations === 0) {
        clearInterval(intervalId);
        console.log("Гра закінчена");
        return;
      }

      this.matrix = this.getNextGeneration();

      this.displayState();
      this.generations--;
    };

    const intervalId = setInterval(updateAndDisplay, interval);

    updateAndDisplay();
  }

  getStateInTheNextGeneration(row, col) {
    let liveNeighborCounter = 0;

    const neighborOffsets = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dr, dc] of neighborOffsets) {
      const neighborRow = row + dr;
      const neighborCol = col + dc;

      // Проверяем, находятся ли соседние клетки внутри границ матрицы и являются ли они живыми
      if (
        neighborRow >= 0 &&
        neighborRow < this.rows &&
        neighborCol >= 0 &&
        neighborCol < this.columns &&
        this.matrix[neighborRow][neighborCol] === 1
      ) {
        liveNeighborCounter++;
      }
    }

    if (this.matrix[row][col]) {
      if (liveNeighborCounter < 2 || liveNeighborCounter > 3) {
        return 0;
      }
    } else {
      if (liveNeighborCounter === 3) {
        return 1;
      }
    }

    return this.matrix[row][col];
  }

  getNextGeneration() {
    const newMatrix = this.matrix.map((row) => [...row]);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        newMatrix[i][j] = this.getStateInTheNextGeneration(i, j);
      }
    }
    return newMatrix;
  }
}
