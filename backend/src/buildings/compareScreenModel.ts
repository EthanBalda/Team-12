import buildingsData from "./buildOptions.json";
 
export type Build = {
	name: string;
	money: number;
	happiness: number;
	population: number;
};
 
export class compareScreenModel {
	private stats: Build | null = null;
	private buildings: Build[] = buildingsData as Build[];
 
	/**
	 * Set the Build stats (null if they couldn't be loaded)
	 */
	setStats(stats: Build | null): void {
		this.stats = stats;
	}
 
	/**
	 * Get the Build stats
	 */
	getStats(): Build | null {
		return this.stats;
	}
 
	/**
	 * Pick a random building from the JSON list and store it as the current stats.
	 * Pass the other tab's build as `exclude` so both tabs never show the same one.
	 * Returns null (and stores null) if there is nothing to pick.
	 */
	pickRandomBuild(exclude: Build | null = null): Build | null {
		const pool = this.buildings.filter((b) => b.name !== exclude?.name);
 
		if (pool.length === 0) {
			this.stats = null;
			return null;
		}
 
		const index = Math.floor(Math.random() * pool.length);
		this.stats = pool[index];
		return this.stats;
	}
}


