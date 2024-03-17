import { EyePhysicsConfig } from "./types";

export class EyePhysicsController implements EyePhysicsConfig
{
	public BaseDiameter: number;
	public PupilDiameter: number;
	public Elasticity: number;

	public Velocity = Vector2.zero;
	public Position = Vector2.zero;

	public constructor(config: EyePhysicsConfig)
	{
		this.BaseDiameter = config.BaseDiameter;
		this.PupilDiameter = config.PupilDiameter;
		this.Elasticity = config.Elasticity ?? 0.7;
	}

	public AddForce(force: Vector2): void
	{
		this.Velocity = this.Velocity.add(force);
	}

	public Step(deltaTime: number): void
	{
		const collide_dist = this.BaseDiameter / 2 - this.PupilDiameter / 2;
		this.Position = this.Position.add(this.Velocity.mul(deltaTime));

		if (this.Position.Magnitude > collide_dist)
		{
			const unit = this.Position.Unit;
			this.Position = unit.mul(collide_dist);
			const direction = this.Velocity.mul(-1);
			const normal = new Vector2(-unit.Y, unit.X);
			const reflected = direction.sub(normal.mul(2 * direction.Dot(normal)));
			this.Velocity = reflected.mul(this.Elasticity);
		}
	}
}
