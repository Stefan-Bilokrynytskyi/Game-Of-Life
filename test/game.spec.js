import GameOfLife from "../Game";
import fs from "fs";

describe("Game", () => {
  let game;
  const pathFile = "/input.txt";

  beforeEach(() => {
    game = new GameOfLife(pathFile);

    jest.useFakeTimers();
    jest.spyOn(global, "setInterval");
  });

  afterEach(() => {
    game = undefined;
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(game).toBeDefined();
  });

  describe("parseMatrix", () => {
    it("should return a matrix of 1s and 0s", () => {
      const matrix = ["x.", ".x"];
      const expected = [
        [1, 0],
        [0, 1],
      ];
      const result = game.parseMatrix(matrix);

      expect(result).toEqual(expected);
    });

    it("should return an empty matrix if input is empty", () => {
      const matrix = [];
      const expected = [];
      const result = game.parseMatrix(matrix);

      expect(result).toEqual(expected);
    });

    it("should return a matrix of all 0s if input is all Os", () => {
      const matrix = ["...", "...", "..."];
      const expected = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      const result = game.parseMatrix(matrix);

      expect(result).toEqual(expected);
    });
  });

  describe("isValidData", () => {
    it("should throw error if input is valid", () => {
      const rows = 2;
      const columns = 2;
      const error = new Error(
        "Invalid input: The number of rows in the matrix doesn`t match the specified rows."
      );
      const matrix = ["....", "....", "...."];

      expect(() => game.isValidData(matrix, columns, rows)).toThrow(error);
    });

    it("should throw error if input is invalid", () => {
      const rows = 2;
      const columns = 3;
      const error = new Error(
        "Invalid input: Inconsistent column count in the matrix."
      );
      const matrix = ["x.", ".x"];

      expect(() => game.isValidData(matrix, columns, rows)).toThrow(error);
    });

    it("should return undefined if input is invalid", () => {
      const rows = 2;
      const columns = 3;
      const matrix = ["x..", ".x."];

      const result = game.isValidData(matrix, columns, rows);

      expect(result).toBeUndefined();
    });
  });

  describe("getData", () => {
    it("should return an array of 4 elements", () => {
      const pathToFile = "/input.txt";

      jest.spyOn(fs, "readFileSync").mockImplementation(() => {
        return "3\n8 5\n........\n..x.....\n..x.....\n..x.....\n........";
      });
      jest.spyOn(game, "isValidData").mockImplementation(() => undefined);
      jest.spyOn(game, "parseMatrix").mockImplementation(() => [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ]);

      const result = game.getData(pathToFile);

      expect(result.length).toBe(4);
    });
  });

  describe("getStateInTheNextGeneration", () => {
    it("should return 0", () => {
      const gameOfLife = new GameOfLife(pathFile);
      const row = 1;
      const col = 1;

      jest
        .spyOn(game, "getStateInTheNextGeneration")
        .mockImplementation((row, col) => {
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
              neighborRow < gameOfLife.rows &&
              neighborCol >= 0 &&
              neighborCol < gameOfLife.columns &&
              gameOfLife.matrix[neighborRow][neighborCol] === 1
            ) {
              liveNeighborCounter++;
            }
          }

          if (gameOfLife.matrix[row][col]) {
            if (liveNeighborCounter < 2 || liveNeighborCounter > 3) {
              return 0;
            }
          } else {
            if (liveNeighborCounter === 3) {
              return 1;
            }
          }

          return gameOfLife.matrix[row][col];
        });

      const result = game.getStateInTheNextGeneration(row, col);

      expect(result).toBe(1);
    });
  });
});
