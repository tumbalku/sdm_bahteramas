import {User} from "lucide-react"

import {InputGroup, InputGroupAddon, InputGroupInput,} from "@/components/ui/input-group"

function PreviewPage() {
  return (<div>
      <h1 className={"text-3xl text-center"}>Componenet previews</h1>
      <div className="flex flex-col">

        <InputGroup className="max-w-xs">
          <InputGroupInput placeholder="Search..."/>
          <InputGroupAddon>
            <User className="w-5 h-5"/>
          </InputGroupAddon>
        </InputGroup>


      </div>
    </div>);
}

export default PreviewPage;