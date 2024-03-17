import { Config } from "config";

export function CameraReactionForce(delta: Vector3): Vector3
{
	const x = math.abs(delta.X) > 0.0001 ? delta.X : 0;
	const y = math.abs(delta.Y) > 0.0001 ? delta.Y : 0;
	const z = math.abs(delta.Z) > 0.0001 ? delta.Z : 0;

	if (delta.Magnitude > 0.001)
	{
		return new Vector3(x, y, z).mul(Config.GRAVITY);
	}
	else
	{
		return Vector3.zero;
	}
}
