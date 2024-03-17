import { AssetsFolder } from "types";

export interface GooglyEyeProps
{
	Base: AssetsFolder["googly_base_full"];
	BaseName: string;
	Pupil: AssetsFolder["googly_pupil"];
	PupilName: string;
	Parent: Instance;
}
