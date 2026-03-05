// Minimal mock for music-metadata used in tests
export const parseFile = async (_filePath: string) => {
  return {
    format: {
      duration: 1.0,
    },
  };
};

export default { parseFile };
