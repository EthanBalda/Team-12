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
	private currentTier = 1;

	/**
	 * Pick two different random buildings from the JSON list
	 */
	pickNewPair(): void {
		const tierBuilds = this.buildings.filter((b) => b.tier === this.currentTier);
		this.leftBuild = this.pickRandomBuild(tierBuilds);
		this.rightBuild = this.pickRandomBuild(tierBuilds, this.leftBuild);
	}

	getLeftBuild(): Build | null {
		return this.leftBuild;
	}

	getRightBuild(): Build | null {
		return this.rightBuild;
	}

	/**
	 * Move to the next tier. Returns false if already on the highest tier.
	 */
	advanceTier(): boolean {
		const maxTier = Math.max(...this.buildings.map((b) => b.tier));
		if (this.currentTier >= maxTier) return false;
		this.currentTier++;
		return true;
	}

	getCurrentTier(): number {
		return this.currentTier;
	}

	/**
	 * Pick a random building without the same twice
	 */
	private pickRandomBuild(pool: Build[], exclude: Build | null = null): Build | null {
		const candidates = pool.filter((b) => b.name !== exclude?.name);
		if (candidates.length === 0) return null;
		return candidates[Math.floor(Math.random() * candidates.length)];
	}
}
