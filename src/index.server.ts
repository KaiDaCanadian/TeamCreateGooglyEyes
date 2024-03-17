import { PhysicsService, Players, RunService, Workspace } from "@rbxts/services";
import { EyePhysicsController } from "EyePhysicsController";
import { EyePhysicsConfig } from "EyePhysicsController/types";
import { AssetsFolder } from "types";

const ASSETS = <AssetsFolder> script.WaitForChild("assets", math.huge);

const TOOLBAR = plugin.CreateToolbar("Googly Eyes");
const LOCAL_VIEW_TOGGLE = TOOLBAR.CreateButton(
	"Toggle View",
	"Toggle eyes locally (everyone else can still see them if this is off)",
	"http://www.roblox.com/asset/?id=321116226"
);

const SPOTLIGHT_TOGGLE = TOOLBAR.CreateButton(
	"Toggle Spotlights",
	"Toggle spotlights (works best in the dark, duh)",
	"http://www.roblox.com/asset/?id=64941856"
);

const CONTAINER = Workspace.Terrain;
let CAMERA = Workspace.CurrentCamera;

const GRAVITY = 4;
const BASE_DIAMETER = 0.5;
const BASE_THICKNESS = 0.125;
const PUPIL_DIAMETER = 0.25;
const PUPIL_THICKNESS = 0.0625;
const ELASTICITY = 0.7;
const EYE_DISTANCE = 0.5;
const EYE_SPREAD = 0.5;

const GOOGLY_BASE = ASSETS.googly_base_full;
const GOOGLY_BASE_PUPIL = ASSETS.googly_pupil;
const TERRAIN = Workspace.Terrain;
const PLAYER = <Player | undefined> Players.LocalPlayer;
const PLAYER_NAME = PLAYER?.Name ?? "default";

const GOOGLY_BASE_NAME_LEFT = `${PLAYER_NAME}_googly_base_left`;
const GOOGLY_BASE_PUPUL_NAME_LEFT = `${PLAYER_NAME}_googly_pupil_left`;
const GOOGLY_BASE_NAME_RIGHT = `${PLAYER_NAME}_googly_base_right`;
const GOOGLY_BASE_PUPUL_NAME_RIGHT = `${PLAYER_NAME}_googly_pupil_right`;

const STUDIO_SELECTABLE_GROUP_NAME = "StudioSelectable";
const STUDIO_UNSELECTABLE_GROUP_NAME = "StudioUnselectable";

const config: EyePhysicsConfig = {
	BaseDiameter: BASE_DIAMETER,
	PupilDiameter: PUPIL_DIAMETER,
	Elasticity: ELASTICITY,
};

const controller_left = new EyePhysicsController(config);
const base_left = <AssetsFolder["googly_base_full"]> TERRAIN.FindFirstChild(GOOGLY_BASE_NAME_LEFT) ?? GOOGLY_BASE.Clone();
const base_pupil_left = <AssetsFolder["googly_pupil"]> TERRAIN.FindFirstChild(GOOGLY_BASE_PUPUL_NAME_LEFT) ?? GOOGLY_BASE_PUPIL.Clone();
base_left.Name = GOOGLY_BASE_NAME_LEFT;
base_left.Size = new Vector3(BASE_THICKNESS, BASE_DIAMETER, BASE_DIAMETER);
base_left.Archivable = false;
base_left.Parent = CONTAINER;
base_pupil_left.Name = GOOGLY_BASE_PUPUL_NAME_LEFT;
base_pupil_left.Size = new Vector3(PUPIL_THICKNESS, PUPIL_DIAMETER, PUPIL_DIAMETER);
base_pupil_left.Archivable = false;
base_pupil_left.Parent = CONTAINER;

const controller_right = new EyePhysicsController(config);
const base_right = <AssetsFolder["googly_base_full"]> TERRAIN.FindFirstChild(GOOGLY_BASE_NAME_RIGHT) ?? GOOGLY_BASE.Clone();
const base_pupil_right = <AssetsFolder["googly_pupil"]> TERRAIN.FindFirstChild(GOOGLY_BASE_PUPUL_NAME_RIGHT) ?? GOOGLY_BASE_PUPIL.Clone();
base_right.Name = GOOGLY_BASE_NAME_RIGHT;
base_right.Size = new Vector3(BASE_THICKNESS, BASE_DIAMETER, BASE_DIAMETER);
base_right.Archivable = false;
base_right.Parent = CONTAINER;
base_pupil_right.Name = GOOGLY_BASE_PUPUL_NAME_RIGHT;
base_pupil_right.Size = new Vector3(PUPIL_THICKNESS, PUPIL_DIAMETER, PUPIL_DIAMETER);
base_pupil_right.Archivable = false;
base_pupil_right.Parent = CONTAINER;

base_left.LocalTransparencyModifier = 1;
base_pupil_left.LocalTransparencyModifier = 1;
base_right.LocalTransparencyModifier = 1;
base_pupil_right.LocalTransparencyModifier = 1;

if (!PhysicsService.IsCollisionGroupRegistered(STUDIO_SELECTABLE_GROUP_NAME))
{
	PhysicsService.RegisterCollisionGroup(STUDIO_SELECTABLE_GROUP_NAME);
}

if (!PhysicsService.IsCollisionGroupRegistered(STUDIO_UNSELECTABLE_GROUP_NAME))
{
	PhysicsService.RegisterCollisionGroup(STUDIO_UNSELECTABLE_GROUP_NAME);
}

PhysicsService.CollisionGroupSetCollidable(STUDIO_SELECTABLE_GROUP_NAME, STUDIO_UNSELECTABLE_GROUP_NAME, false);

[base_left, base_pupil_left, base_right, base_pupil_right].forEach((part) =>
{
	part.CollisionGroup = STUDIO_UNSELECTABLE_GROUP_NAME;
});

let left_cf: CFrame;
let left_vel: Vector3;
let right_cf: CFrame;
let right_vel: Vector3;

function CameraReactionForce(delta: Vector3): Vector3
{
	const x = math.abs(delta.X) > 0.0001 ? delta.X : 0;
	const y = math.abs(delta.Y) > 0.0001 ? delta.Y : 0;
	const z = math.abs(delta.Z) > 0.0001 ? delta.Z : 0;

	if (delta.Magnitude > 0.001)
	{
		return new Vector3(x, y, z).mul(GRAVITY);
	}
	else
	{
		return Vector3.zero;
	}
}

const RenderSteppedConnection = RunService.RenderStepped.Connect(deltaTime =>
{
	if (!CAMERA) return;

	const pupil_forward = BASE_THICKNESS / 2 + PUPIL_THICKNESS / 2;
	const rotation = CFrame.Angles(0, math.pi / 2, 0);

	const left_pos = controller_left.Position;
	const left_offset_1 = CAMERA.CFrame.mul(new CFrame(-EYE_SPREAD, 0, -EYE_DISTANCE)).mul(rotation);
	base_left.CFrame = left_offset_1;
	base_pupil_left.CFrame = left_offset_1
		.mul(new CFrame(pupil_forward, 0, 0))
		.mul(new CFrame(0, left_pos.Y, left_pos.X));

	const right_pos = controller_right.Position;
	const right_offset_1 = CAMERA.CFrame.mul(new CFrame(EYE_SPREAD, 0, -EYE_DISTANCE)).mul(rotation);
	base_right.CFrame = right_offset_1;
	base_pupil_right.CFrame = right_offset_1
		.mul(new CFrame(pupil_forward, 0, 0))
		.mul(new CFrame(0, right_pos.Y, right_pos.X));

	const gravity_influence = -CAMERA.CFrame.UpVector.Dot(new Vector3(0, -1, 0));
	const gravity_force = new Vector2(0, -GRAVITY * gravity_influence).mul(deltaTime);

	controller_left.AddForce(gravity_force);
	controller_right.AddForce(gravity_force);

	let left_offset = Vector3.zero;

	if (left_cf)
	{
		left_offset = (left_cf.Inverse().mul(base_left.CFrame)).Position;
	}

	if (left_vel)
	{
		const vec = CameraReactionForce(left_offset.sub(left_vel));
		const force = new Vector2(-vec.X - vec.Z, -vec.Y);
		controller_left.AddForce(force);
	}

	let right_offset = Vector3.zero;

	if (right_cf)
	{
		right_offset = (right_cf.Inverse().mul(base_right.CFrame)).Position;
	}

	if (right_vel)
	{
		const vec = CameraReactionForce(right_offset.sub(right_vel));
		const force = new Vector2(vec.X - vec.Z, -vec.Y);
		controller_right.AddForce(force);
	}

	controller_left.Step(deltaTime);
	controller_right.Step(deltaTime);

	left_cf = base_left.CFrame;
	left_vel = left_offset;
	right_cf = base_right.CFrame;
	right_vel = right_offset;
});

const CameraChangedConnection = Workspace.GetPropertyChangedSignal("CurrentCamera").Connect(() =>
{
	CAMERA = Workspace.CurrentCamera;
});

let view_toggled = false;

LOCAL_VIEW_TOGGLE.Click.Connect(() =>
{
	LOCAL_VIEW_TOGGLE.SetActive(!view_toggled);
	view_toggled = !view_toggled;

	base_left.LocalTransparencyModifier = view_toggled ? 0.8 : 1;
	base_pupil_left.LocalTransparencyModifier = view_toggled ? 0.8 : 1;
	base_right.LocalTransparencyModifier = view_toggled ? 0.8 : 1;
	base_pupil_right.LocalTransparencyModifier = view_toggled ? 0.8 : 1;
});

let lights_toggled = false;

SPOTLIGHT_TOGGLE.Click.Connect(() =>
{
	SPOTLIGHT_TOGGLE.SetActive(!lights_toggled);
	lights_toggled = !lights_toggled;
	const eye_material = Enum.Material[lights_toggled ? "Neon" : "SmoothPlastic"];

	base_left.googly_spotlight.Enabled = lights_toggled;
	base_left.Material = eye_material;
	base_right.googly_spotlight.Enabled = lights_toggled;
	base_right.Material = eye_material;
});

function deactivate()
{
	base_left.Destroy();
	base_pupil_left.Destroy();
	base_right.Destroy();
	base_pupil_right.Destroy();
	RenderSteppedConnection.Disconnect();
	CameraChangedConnection.Disconnect();
}

plugin.Unloading.Connect(deactivate);

// function main()
// {
// 	if (!RunService.IsEdit()) return;

// 	// move code here...
// }

// main();
