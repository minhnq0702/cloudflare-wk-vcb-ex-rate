import { parseString } from 'xml2js';
const VCB_EX_RATE = 'https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx?b=10';


function preProcess(value: string, name: string) {
  console.log('preProcess==>', name, value)
  const _val = value.replace(/,/g, '');
  if (['Buy', 'Transfer', 'Sell'].includes(name) && (!isNaN(parseFloat(_val)))) { 
    // convert value to float if value is a number
      return parseFloat(_val);
  }
  return value.trim();
}

export type ExRateData ={
  CurrencyCode: string;
  CurrencyName: string;
  Buy: number;
  Transfer: number;
  Sell: number;
};

type ExRate = {
  '$': ExRateData;
};


const getExRate = async (): Promise<ExRateData[]> => { 
  const res = await fetch(VCB_EX_RATE)
  const data = await res.text()
  console.log(data)

  // process XML data
  const extracted: ExRateData[] = [];
  parseString(data, {
    // valueProcessors: [preProcess],
    attrValueProcessors: [preProcess],
  }, (err, result) => { 
    if (err) {
      console.error(err);
      return;
    }
    // console.log('parsed==>', result);
    extracted.push(
      ...(result.ExrateList.Exrate as ExRate[]).map((item) => { 
        const _item = item['$'];
        return {
          CurrencyCode: _item.CurrencyCode,
          CurrencyName: _item.CurrencyName,
          Buy: _item.Buy,
          Transfer: _item.Transfer,
          Sell: _item.Sell,
        };
      })
    );
  });

  return extracted;
};

export default getExRate;