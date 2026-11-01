import buildingsData from "./buildOptions.json";

export type Build = {
	name: string;
	money: number;
	happiness: number;
	pollution: number;
	tier: number;
};

export class compareScreenModel {
	private buildings: Build[] = buildingsData as Build[];
	private leftBuild: Build | null = null;
	private rightBuild: Build | null = null;

	/**
	 * Pick two different random buildings from the JSON list
	 */
	pickNewPair(): void {
		this.leftBuild = this.pickRandomBuild();
		this.rightBuild = this.pickRandomBuild(this.leftBuild);
	}

	getLeftBuild(): Build | null {
		return this.leftBuild;
	}

	getRightBuild(): Build | null {
		return this.rightBuild;
	}

	/**
	 * Pick a random building. Pass `exclude` to avoid picking the same one twice.
	 * Returns null if there is nothing to pick.
	 */
	private pickRandomBuild(exclude: Build | null = null): Build | null {
		const pool = this.buildings.filter((b) => b.name !== exclude?.name);
		if (pool.length === 0) return null;

		const index = Math.floor(Math.random() * pool.length);
		return pool[index];
	}
}
