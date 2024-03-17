import { AssetsFolder } from "types";
import { GooglyEyeProps } from "./types";
import { Config } from "config";

export class GooglyEye
{
	public Base: AssetsFolder["googly_base_full"];
	public Pupil: AssetsFolder["googly_pupil"];

	public constructor(props: GooglyEyeProps)
	{
		const base = props.Base;
		base.Name = props.BaseName;
		base.Size = new Vector3(Config.BASE_THICKNESS, Config.BASE_DIAMETER, Config.BASE_DIAMETER);
		base.Archivable = false;
		base.Parent = props.Parent;
		base.CollisionGroup = Config.STUDIO_UNSELECTABLE_GROUP_NAME;

		this.Base = base;

		const pupil = props.Pupil;
		pupil.Name = props.PupilName;
		pupil.Size = new Vector3(Config.PUPIL_THICKNESS, Config.PUPIL_DIAMETER, Config.PUPIL_DIAMETER);
		pupil.Archivable = false;
		pupil.Parent = props.Parent;
		pupil.CollisionGroup = Config.STUDIO_UNSELECTABLE_GROUP_NAME;

		this.Pupil = pupil;
	}

	public SetTransparency(transparency: number): void
	{
		this.Base.LocalTransparencyModifier = transparency;
		this.Pupil.LocalTransparencyModifier = transparency;
	}

	public Destroy(): void
	{
		this.Base.Destroy();
		this.Pupil.Destroy();
	}
}
