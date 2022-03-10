import axios from 'axios'
import parselinks from 'parse-link-header'

export default class Paginator {

    static async first(request, raw_response = false){
        return await this.getPage(request, raw_response)
    }

    static async last(request, raw_response = false){
        let response = await this.getPage(request, true)
        let pages = parselinks(response.headers.link)
        request.url = pages.last.url
        return await this.getPage(request, raw_response)
    }

    static async all(request, merged_pages = true, raw_response = false){
        var pages = []
        var pagination = null
        do {
            let response = await this.getPage(request, true)
            pages.push(this.returnReponse(response, raw_response))
            pagination = parselinks(response.headers.link)
            if(typeof(pagination.next) != 'undefined'){
                request.url = pagination.next.url
            }
        } while(typeof(pagination.next) != 'undefined')
        if(merged_pages){
            pages = this.mergePages(pages)
        }
        return pages
    }

    static mergePages(pages){
        let merged = []
        pages.forEach((page) => {
            merged = merged.concat(page)
        })
        return merged
    }

    static async getPage(request, raw_response = false){
        let response = await this.executeRequest(request)
        return this.returnReponse(response, raw_response)
    }

    static returnReponse(response, raw_response){
        if(raw_response){
            return response
        }
        if(response.status == 200){
            return response.data 
        } 
        throw new Exception(response)
    }

    static async executeRequest(request){
        let response = await axios(request)
        return await response
    }
}