import type {InitialOptionsTsJest} from 'ts-jest/dist/types'

const config: InitialOptionsTsJest = {
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^~/(.*)$": "<rootDir>/$1",
    },
    moduleFileExtensions: ["ts", "js", "vue", "json"],
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
}
export default config
