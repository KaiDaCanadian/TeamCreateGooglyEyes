import { PhysicsService, Players, RunService, Workspace } from "@rbxts/services";
import { GooglyEye } from "classes/GooglyEye";
import { Config } from "config";
import { CameraController } from "controllers/CameraController";
import { EyePhysicsController } from "controllers/EyePhysicsController";
import { EyePhysicsConfig } from "controllers/EyePhysicsController/types";
import { PluginToolbarController } from "controllers/PluginToolbarController";
import { CameraReactionForce as GetCameraReactionForce } from "modules/util";
import { AssetsFolder } from "types";

const CAMERA_CONTROLLER = new CameraController(Workspace.CurrentCamera);
const PLUGIN_TOOLBAR_CONTROLLER = new PluginToolbarController(plugin);

const ASSETS = <AssetsFolder> script.WaitForChild("assets", math.huge);
const CONTAINER = Workspace.Terrain;

const GOOGLY_BASE = ASSETS.googly_base_full;
const GOOGLY_BASE_PUPIL = ASSETS.googly_pupil;
const PLAYER = <Player | undefined> Players.LocalPlayer;
const PLAYER_NAME = PLAYER?.Name ?? "default";

const GOOGLY_BASE_NAME_LEFT = `${PLAYER_NAME}_googly_base_left`;
const GOOGLY_BASE_PUPUL_NAME_LEFT = `${PLAYER_NAME}_googly_pupil_left`;
const GOOGLY_BASE_NAME_RIGHT = `${PLAYER_NAME}_googly_base_right`;
const GOOGLY_BASE_PUPUL_NAME_RIGHT = `${PLAYER_NAME}_googly_pupil_right`;

function main()
{
	if (!RunService.IsEdit()) return;

	CAMERA_CONTROLLER.BindToCameraChanged();

	/* Googly Eyes Models */
	const googly_eyes = <const> [
		new GooglyEye({
			Base: <AssetsFolder["googly_base_full"]> CONTAINER.FindFirstChild(GOOGLY_BASE_NAME_LEFT) ?? GOOGLY_BASE.Clone(),
			BaseName: GOOGLY_BASE_NAME_LEFT,
			Pupil: <AssetsFolder["googly_pupil"]> CONTAINER.FindFirstChild(GOOGLY_BASE_PUPUL_NAME_LEFT) ?? GOOGLY_BASE_PUPIL.Clone(),
			PupilName: GOOGLY_BASE_PUPUL_NAME_LEFT,
			Parent: CONTAINER,
		}),

		new GooglyEye({
			Base: <AssetsFolder["googly_base_full"]> CONTAINER.FindFirstChild(GOOGLY_BASE_NAME_RIGHT) ?? GOOGLY_BASE.Clone(),
			BaseName: GOOGLY_BASE_NAME_RIGHT,
			Pupil: <AssetsFolder["googly_pupil"]> CONTAINER.FindFirstChild(GOOGLY_BASE_PUPUL_NAME_RIGHT) ?? GOOGLY_BASE_PUPIL.Clone(),
			PupilName: GOOGLY_BASE_PUPUL_NAME_RIGHT,
			Parent: CONTAINER,
		}),
	];

	/* Toolbar */
	PLUGIN_TOOLBAR_CONTROLLER.BindToButtonEvents();

	PLUGIN_TOOLBAR_CONTROLLER.ViewToggledStateChanged.Connect(newState => googly_eyes.forEach(eye => eye.SetTransparency(newState ? 0.8 : 1)));
	googly_eyes.forEach(eye => eye.SetTransparency(PLUGIN_TOOLBAR_CONTROLLER.ViewToggledState ? 0.8 : 1));

	PLUGIN_TOOLBAR_CONTROLLER.SpotlightToggledStateChanged.Connect(newState =>
	{
		googly_eyes.forEach(eye =>
		{
			eye.Base.googly_spotlight.Enabled = newState;
			eye.Base.Material = newState ? Enum.Material.Neon : Enum.Material.SmoothPlastic;
		});
	});

	/* Physics */
	if (!PhysicsService.IsCollisionGroupRegistered(Config.STUDIO_SELECTABLE_GROUP_NAME))
	{
		PhysicsService.RegisterCollisionGroup(Config.STUDIO_SELECTABLE_GROUP_NAME);
	}

	if (!PhysicsService.IsCollisionGroupRegistered(Config.STUDIO_UNSELECTABLE_GROUP_NAME))
	{
		PhysicsService.RegisterCollisionGroup(Config.STUDIO_UNSELECTABLE_GROUP_NAME);
	}

	PhysicsService.CollisionGroupSetCollidable(Config.STUDIO_SELECTABLE_GROUP_NAME, Config.STUDIO_UNSELECTABLE_GROUP_NAME, false);

	const config: EyePhysicsConfig = {
		BaseDiameter: Config.BASE_DIAMETER,
		PupilDiameter: Config.PUPIL_DIAMETER,
		Elasticity: Config.ELASTICITY,
	};

	const physics_controllers = <const> [
		new EyePhysicsController(config),
		new EyePhysicsController(config),
	];

	let left_cf: CFrame;
	let left_vel: Vector3;
	let right_cf: CFrame;
	let right_vel: Vector3;

	const RenderSteppedConnection = RunService.RenderStepped.Connect(deltaTime =>
	{
		const CAMERA = CAMERA_CONTROLLER.CurrentCamera;
		if (!CAMERA) return;

		const pupil_forward = Config.BASE_THICKNESS / 2 + Config.PUPIL_THICKNESS / 2;
		const rotation = CFrame.Angles(0, math.pi / 2, 0);

		const left_base_pos = physics_controllers[0].Position;
		const left_base_offset = CAMERA.CFrame.mul(new CFrame(-Config.EYE_SPREAD, 0, -Config.EYE_DISTANCE)).mul(rotation);
		googly_eyes[0].Base.CFrame = left_base_offset;
		googly_eyes[0].Pupil.CFrame = left_base_offset
			.mul(new CFrame(pupil_forward, 0, 0))
			.mul(new CFrame(0, left_base_pos.Y, left_base_pos.X));

		const right_base_pos = physics_controllers[1].Position;
		const right_base_offset = CAMERA.CFrame.mul(new CFrame(Config.EYE_SPREAD, 0, -Config.EYE_DISTANCE)).mul(rotation);
		googly_eyes[1].Base.CFrame = right_base_offset;
		googly_eyes[1].Pupil.CFrame = right_base_offset
			.mul(new CFrame(pupil_forward, 0, 0))
			.mul(new CFrame(0, right_base_pos.Y, right_base_pos.X));

		const gravity_influence = -CAMERA.CFrame.UpVector.Dot(new Vector3(0, -1, 0));
		const gravity_force = new Vector2(0, -Config.GRAVITY * gravity_influence).mul(deltaTime);

		physics_controllers[0].AddForce(gravity_force);
		physics_controllers[1].AddForce(gravity_force);

		let left_offset = Vector3.zero;

		if (left_cf)
		{
			left_offset = (left_cf.Inverse().mul(googly_eyes[0].Base.CFrame)).Position;
		}

		if (left_vel)
		{
			const vec = GetCameraReactionForce(left_offset.sub(left_vel));
			const force = new Vector2(-vec.X - vec.Z, -vec.Y);
			physics_controllers[0].AddForce(force);
		}

		let right_offset = Vector3.zero;

		if (right_cf)
		{
			right_offset = (right_cf.Inverse().mul(googly_eyes[1].Base.CFrame)).Position;
		}

		if (right_vel)
		{
			const vec = GetCameraReactionForce(right_offset.sub(right_vel));
			const force = new Vector2(vec.X - vec.Z, -vec.Y);
			physics_controllers[1].AddForce(force);
		}

		physics_controllers[0].Step(deltaTime);
		physics_controllers[1].Step(deltaTime);

		left_cf = googly_eyes[0].Base.CFrame;
		left_vel = left_offset;
		right_cf = googly_eyes[1].Base.CFrame;
		right_vel = right_offset;
	});

	function Deactivate()
	{
		googly_eyes.forEach(eye => eye.Destroy());
		RenderSteppedConnection.Disconnect();
		CAMERA_CONTROLLER.UnbindFromCameraChanged();
		PLUGIN_TOOLBAR_CONTROLLER.Destroy();
	}

	plugin.Unloading.Connect(Deactivate);
}

main();
