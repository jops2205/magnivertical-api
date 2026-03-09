import { District } from "@/schemas/address-schema";

type FormattedDistrict = {
	key: string;
	value: District;
};

const FORMATTED_DISTRICTS: FormattedDistrict[] = [
	{
		key: "Açores",
		value: District.ACORES,
	},
	{
		key: "Aveiro",
		value: District.AVEIRO,
	},
	{
		key: "Beja",
		value: District.BEJA,
	},
	{
		key: "Braga",
		value: District.BRAGA,
	},
	{
		key: "Bragança",
		value: District.BRAGANCA,
	},
	{
		key: "Castelo Branco",
		value: District.CASTELO_BRANCO,
	},
	{
		key: "Coimbra",
		value: District.COIMBRA,
	},
	{
		key: "Évora",
		value: District.EVORA,
	},
	{
		key: "Faro",
		value: District.FARO,
	},
	{
		key: "Guarda",
		value: District.GUARDA,
	},
	{
		key: "Leiria",
		value: District.LEIRIA,
	},
	{
		key: "Lisboa",
		value: District.LISBOA,
	},
	{
		key: "Madeira",
		value: District.MADEIRA,
	},
	{
		key: "Portalegre",
		value: District.PORTALEGRE,
	},
	{
		key: "Porto",
		value: District.PORTO,
	},
	{
		key: "Santarém",
		value: District.SANTAREM,
	},
	{
		key: "Setúbal",
		value: District.SETUBAL,
	},
	{
		key: "Viana do Castelo",
		value: District.VIANA_DO_CASTELO,
	},
	{
		key: "Vila Real",
		value: District.VILA_REAL,
	},
	{
		key: "Viseu",
		value: District.VISEU,
	},
];

const formattedDistrictMap = new Map(
	FORMATTED_DISTRICTS.map(({ key, value }) => [value, key]),
);

export const getDistrict = (district: District) => {
	return formattedDistrictMap.get(district) ?? district;
};
