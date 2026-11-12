import buildingsData from "./buildOptions.json";

export type Build = {
	name: string;
	type: string;
	money: number;
	populationLoss: number;
	pollution: number;
	tier: number;
};

export class compareScreenModel {
	private buildings: Build[] = buildingsData as Build[];
	private currentTier = 1;
	private choices: (Build | null)[] = [];

	pickNewChoices(): void {
	const pool = this.buildings.filter((b) => b.tier === this.currentTier);

	// Shuffle a copy, then take the first three (all distinct)
	const shuffled = [...pool];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	this.choices = Array.from({ length: 3 }, (_, i) => shuffled[i] ?? null); // Picks 3 buildings
	}

	getChoices(): (Build | null)[] {
	return this.choices;
	}

	/**
	 * Move to the next tier.
	 */
	setTier(tier: number): void {
		const maxTier = Math.max(...this.buildings.map((b) => b.tier));
		this.currentTier = Math.max(1, Math.min(tier, maxTier));
	}

	getCurrentTier(): number {
		return this.currentTier;
	}

	reset(): void {
		this.currentTier = 1;
	}
}
