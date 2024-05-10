import { Consumer, Kafka, Producer } from "@upstash/kafka";

type KafkaArgs = {
  url: string;
  clientId?: string;
  username: string;
  password: string;
};

export interface ProducerManagerInterface {
  url: string;
  username: string;
  password: string;
  clientId: string | null;
  kafka: any | null;
  producer: any | null;
  consumer: any | null;
  produceOne(topic: string, msg: any, key?: string): Promise<any>;
}



class ProducerManagerUpstash implements ProducerManagerInterface {
  // * define attrs
  url: string = '';
  username: string;
  password: string;
  clientId: string | null = null;
  kafka: Kafka | null = null;
  producer: Producer | null = null;
  consumer: Consumer | null = null;

  public constructor(args: KafkaArgs) {
    this.url = args.url;
    this.clientId = args.clientId || null;
    this.username = args.username;
    this.password = args.password;
    this.kafka = this.initKafka();
    this.producer = this.kafka.producer();
    
    // this.connect();
  }

  private initKafka() {
    return new Kafka({
      url: this.url,
      username:this.username,
      password: this.password,
    });
  }


  async produceOne(topic: string, msg: any, key?: string): Promise<any> {
    return await this.producer?.produce(topic, msg, {
      key: key,
    });
  }
}
  
export {
  ProducerManagerUpstash
};
