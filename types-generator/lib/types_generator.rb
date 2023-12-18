require "nokogiri"
require "json"

class TypesGenerator
  class << self
    attr_reader :root_dir, :root_html

    ROOT_DIR = File.join(File.dirname(__FILE__), "../../td/docs/html/")
    ROOT_HTML = File.join(ROOT_DIR, "hierarchy.html")

    def run
      raise("File not found: #{ROOT_HTML}") unless File.exist?(ROOT_HTML)

      pages = parse_root_page
      parse_pages(pages)
    end

    private

    def parse_root_page
      Nokogiri::HTML(File.open(ROOT_HTML)).xpath("//table[@class='directory']/tr[@style='display:none;']/td[@class='entry']/a[@class='el' and starts-with(text(), 'td::td_api::')]")
    end

    def parse_pages(pages)
      result = pages.each_with_object({}) do |page, obj|
        name = page.text.gsub("td::td_api::", "")
        page_file = page["href"]
        page_path = File.join(ROOT_DIR, page_file)
        raise("File not found: #{page_path}") unless File.exist?(page_path)

        parsed_page = begin
          parse_page(page_path)
        rescue => e
          puts "Error parsing page: #{page_path}"
        end

        obj[name] = parsed_page.merge(url: "https://core.telegram.org/tdlib/docs/#{page_file}") if parsed_page
      end

      File.open(File.join(File.dirname(__FILE__), "../../types.json"), "w") do |f|
        f.write(JSON.pretty_generate(result))
      end
    end

    def parse_page(page_path)
      page = Nokogiri::HTML(File.open(page_path))

      type = page.xpath("//map/area[@alt = 'td::td_api::Object' or @alt = 'td::td_api::Function']/@alt").collect(&:value).first
      raise :not_found unless type

      object = {
        type: type(type),
        desc: page.xpath("//div[@class='textblock']/p").map { |p| p.text.strip }.join("\n")
      }

      fields = fields(page.xpath("//table[tr/td/h2/a[@id='pub-attribs']]"))
      extends = extends(object[:type])
      returnType = page.xpath("//table[@class='memberdecls']/tr[starts-with(@class, 'memitem')]/td[@class='memItemRight']/b[text()='ReturnType']")
                       .first&.parent&.xpath("a[@class='el']")&.last&.text if object[:type] == "function"
      object.merge(returnType:) if returnType
      object.merge(fields:, extends:)
    end

    def fields(fields_table)
      fields_table.xpath("tr[starts-with(@class, 'memitem') or (starts-with(@class, 'memdesc'))]").each_slice(2).map do |item, desc|
        type = item.xpath("td//a[@class='el']")&.last&.text || item.xpath("td[@class='memItemLeft']").text.gsub(/[[:space:]]/, "")
        {
          desc: desc.xpath("td[@class='mdescRight']").first.text.strip,
          name: item.xpath("td[@class='memItemRight']//b").first.text.sub(/_$/, ""),
          type: field_type(type)
        }
      end
    end

    def type(type)
      case type
      when "td::td_api::Object"
        "object"
      when "td::td_api::Function"
        "function"
      end
    end

    def extends(type)
      case type
      when "object"
        "TDObject"
      when "function"
        "TDFunction"
      end
    end

    def field_type(type)
      case type
      when "int32"
        "number"
      when "int53"
        "string"
      when "int64"
        "string"
      else
        type
      end
    end
  end
end
