import { Workspace } from "@rbxts/services";

export class CameraController
{
	public CurrentCamera: Camera | undefined;
	private CameraChangedConnection: RBXScriptConnection | undefined;

	public constructor(currentCamera: Camera | undefined)
	{
		this.CurrentCamera = currentCamera;
	}

	public BindToCameraChanged(): void
	{
		this.CameraChangedConnection = Workspace.GetPropertyChangedSignal("CurrentCamera").Connect(() =>
		{
			this.CurrentCamera = Workspace.CurrentCamera;
		});
	}

	public UnbindFromCameraChanged(): void
	{
		this.CameraChangedConnection?.Disconnect();
	}
}
