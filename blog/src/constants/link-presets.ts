import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { LinkPreset, type NavBarLink } from "@/types/config";

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
	[LinkPreset.Home]: {
		name: i18n(I18nKey.home),
		url: "/",
	},
	[LinkPreset.About]: {
		name: i18n(I18nKey.about),
		url: "/about/",
	},
	[LinkPreset.Archive]: {
		name: i18n(I18nKey.archive),
		url: "/archive/",
	},
};

export const PresetI18nKey: { [key in LinkPreset]: I18nKey } = {
	[LinkPreset.Home]: I18nKey.home,
	[LinkPreset.About]: I18nKey.about,
	[LinkPreset.Archive]: I18nKey.archive,
};
