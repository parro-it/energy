import moment from 'moment';
import map from 'through2-map';
import multipipe from 'multipipe';
import csv from 'csv-streamify';
import slice from 'slice-through';

const mapDetails = filename => map.obj(
  ([IDPTOSCAMBIOVIRTUALE, DA_MISURA, EEA, EUA]) =>
  ({
    type: 'detail',
    filename,
    sapr: IDPTOSCAMBIOVIRTUALE,
    date: moment(DA_MISURA, 'DD/MM/YYYY HH:mm:ss').toISOString(),
    input: Number(EEA),
    output: Number(EUA)
  })
);

const mapRecap = filename => map.obj(
  ([, NomeImpianto, CodicePSV, , DataValidazione, Versione, , TotaleEnergia]) =>
  ({
    type: 'recap',
    filename,
    sapr: CodicePSV,
    name: NomeImpianto,
    version: Number(Versione),
    date: moment(DataValidazione, 'DD/MM/YYYY HH:mm:ss').toISOString(),
    total: Number((TotaleEnergia + '').replace(',', '.'))
  })
);


const csvOpts = {
  delimiter: ';',
  quote: '',
  columns: false,
  objectMode: true
};

export const parseDetails = filename => multipipe(
  csv(csvOpts),
  mapDetails(filename),
  slice(1)
);


export const parseRecap = filename => multipipe(
  csv(csvOpts),
  mapRecap(filename),
  slice(1)
);
