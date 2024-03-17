import Signal from "@rbxts/signal";
import { Config } from "config";

export class PluginToolbarController
{
	public Toolbar: PluginToolbar;
	public ViewToggleButton: PluginToolbarButton;
	public SpotlightToggleButton: PluginToolbarButton;

	public ViewToggledState = false;
	public SpotlightToggledState = false;

	public ViewToggledStateChanged = new Signal<(newState: boolean) => void>();
	public SpotlightToggledStateChanged = new Signal<(newState: boolean) => void>();

	protected ViewToggleButtonConnection: RBXScriptConnection | undefined;
	protected SpotlightToggleButtonConnection: RBXScriptConnection | undefined;

	public constructor(plugin: Plugin)
	{
		this.Toolbar = plugin.CreateToolbar(Config.TOOLBAR_NAME);

		this.ViewToggleButton = this.Toolbar.CreateButton(
			Config.LOCAL_VIEW_TOGGLE_ID,
			Config.LOCAL_VIEW_TOGGLE_TOOLTIP,
			Config.LOCAL_VIEW_TOGGLE_IMAGE
		);

		this.SpotlightToggleButton = this.Toolbar.CreateButton(
			Config.SPOTLIGHT_TOGGLE_ID,
			Config.SPOTLIGHT_TOGGLE_TOOLTIP,
			Config.SPOTLIGHT_TOGGLE_IMAGE
		);
	}

	public BindToButtonEvents(): void
	{
		this.ViewToggleButtonConnection = this.ViewToggleButton.Click.Connect(() =>
		{
			this.ViewToggleButton.SetActive(!this.ViewToggledState);
			this.ViewToggledState = !this.ViewToggledState;
			this.ViewToggledStateChanged.Fire(this.ViewToggledState);
		});

		this.SpotlightToggleButtonConnection = this.SpotlightToggleButton.Click.Connect(() =>
		{
			this.SpotlightToggleButton.SetActive(!this.SpotlightToggledState);
			this.SpotlightToggledState = !this.SpotlightToggledState;
			this.SpotlightToggledStateChanged.Fire(this.SpotlightToggledState);
		});
	}

	public UnbindFromButtonEvents(): void
	{
		this.ViewToggleButtonConnection?.Disconnect();
		this.SpotlightToggleButtonConnection?.Disconnect();
	}

	public Destroy(): void
	{
		this.UnbindFromButtonEvents();
		this.ViewToggledStateChanged.Destroy();
		this.SpotlightToggledStateChanged.Destroy();
		this.Toolbar.Destroy();
	}
}
